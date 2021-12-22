// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "./interface/IStakedToken.sol";
import "./interface/ITreasury.sol";

// TODO lock for staking and withdrawing
contract StakedToken is Ownable, IStakedToken {
  using SafeERC20 for IERC20;
  uint256 constant WAD = 10**18;
  uint256 constant RAY = 10**27;

  IERC20 public BLU;
  ITreasury public treasury;

  // Interest rate information
  uint256 public interestRate; // Interest rate per second [ray]
  uint256 public accumulatedRates; // Accumulated interest rates [ray]
  uint256 public lastInterestRateUpdate; // Last time the interest rate was updated [unix epoch time]

  // Token information
  string public name;
  string public symbol;

  // Normalized states
  mapping(address => uint256) public normalizedBalances;
  uint256 public normalizedTotalSupply;
  uint256 public minimumNormalizedBalance;

  // Denormalized states
  mapping(address => mapping(address => uint256)) private allowances;

  constructor(
    string memory _name,
    string memory _symbol,
    address _BLU,
    address _treasury,
    uint256 _interestRate
  ) {
    name = _name;
    symbol = _symbol;
    BLU = IERC20(_BLU);
    treasury = ITreasury(_treasury);

    lastInterestRateUpdate = block.timestamp;
    interestRate = _interestRate;
    accumulatedRates = RAY;
    minimumNormalizedBalance = WAD / 10**3; // 1/1000th of a BLU
  }

  function stake(uint256 amount, address recipient)
    public
    override
    returns (bool)
  {
    rebase();
    require(recipient != address(0), "Staking to the zero address");
    BLU.safeTransferFrom(msg.sender, address(this), amount);
    _mint(recipient, normalize(amount));
    return true;
  }

  function unstake(uint256 amount, address recipient)
    public
    override
    returns (bool)
  {
    rebase();
    require(recipient != address(0), "Unstaking to the zero address");
    _burn(recipient, normalize(amount));
    BLU.safeTransfer(recipient, amount);
    return true;
  }

  function totalSupply() public view override returns (uint256) {
    return denormalize(normalizedTotalSupply);
  }

  function balanceOf(address account) public view override returns (uint256) {
    return denormalize(normalizedBalances[account]);
  }

  function transfer(address recipient, uint256 amount)
    public
    override
    returns (bool)
  {
    _transfer(msg.sender, recipient, normalize(amount));
    return true;
  }

  function allowance(address owner, address spender)
    public
    view
    override
    returns (uint256)
  {
    return allowances[owner][spender];
  }

  function approve(address spender, uint256 amount)
    public
    override
    returns (bool)
  {
    _approve(msg.sender, spender, amount);
    return true;
  }

  function transferFrom(
    address sender,
    address recipient,
    uint256 amount
  ) public override returns (bool) {
    _transfer(sender, recipient, normalize(amount));

    uint256 currentAllowance = allowances[sender][msg.sender];
    require(
      currentAllowance >= amount,
      "ERC20: transfer amount exceeds allowance"
    );
    _approve(sender, msg.sender, currentAllowance - amount);

    return true;
  }

  function increaseAllowance(address spender, uint256 addedValue)
    public
    returns (bool)
  {
    _approve(msg.sender, spender, allowances[msg.sender][spender] + addedValue);
    return true;
  }

  function decreaseAllowance(address spender, uint256 subtractedValue)
    public
    returns (bool)
  {
    uint256 currentAllowance = allowances[msg.sender][spender];
    require(
      currentAllowance >= subtractedValue,
      "ERC20: decreased allowance below zero"
    );
    _approve(msg.sender, spender, currentAllowance - subtractedValue);

    return true;
  }

  function _transfer(
    address sender,
    address recipient,
    uint256 normalizedAmount
  ) internal {
    require(sender != address(0), "Transfer from the zero address");
    require(recipient != address(0), "Transfer to the zero address");

    require(
      normalizedBalances[sender] >= normalizedAmount,
      "Transfer amount exceeds balance"
    );

    _beforeTokenTransfer(sender, recipient, normalizedAmount);

    normalizedBalances[sender] -= normalizedAmount;
    normalizedBalances[recipient] += normalizedAmount;

    emit Transfer(sender, recipient, denormalize(normalizedAmount));

    _afterTokenTransfer(sender, recipient, normalizedAmount);
  }

  function _mint(address account, uint256 normalizedAmount) internal {
    require(account != address(0), "Minting to the zero address");

    _beforeTokenTransfer(address(0), account, normalizedAmount);

    normalizedTotalSupply += normalizedAmount;
    normalizedBalances[account] += normalizedAmount;
    emit Transfer(address(0), account, denormalize(normalizedAmount));

    _afterTokenTransfer(address(0), account, normalizedAmount);
  }

  function _burn(address account, uint256 normalizedAmount) internal {
    require(account != address(0), "Burn from the zero address");

    _beforeTokenTransfer(account, address(0), normalizedAmount);

    require(
      normalizedBalances[account] >= normalizedAmount,
      "Burn amount exceeds balance"
    );
    normalizedBalances[account] -= normalizedAmount;
    normalizedTotalSupply -= normalizedAmount;

    emit Transfer(account, address(0), denormalize(normalizedAmount));

    _afterTokenTransfer(account, address(0), normalizedAmount);
  }

  function _approve(
    address owner,
    address spender,
    uint256 denormalizedAmount
  ) internal {
    require(owner != address(0), "Approve from the zero address");
    require(spender != address(0), "Approve to the zero address");

    allowances[owner][spender] = denormalizedAmount;
    emit Approval(owner, spender, denormalizedAmount);
  }

  function _zeroMinimumBalances(address account) internal {
    if (
      normalizedBalances[account] < minimumNormalizedBalance &&
      normalizedBalances[account] != 0
    ) {
      // Cannot use _burn here because it would be recursive
      normalizedTotalSupply -= normalizedBalances[account];
      normalizedBalances[account] = 0;
    }
  }

  function _beforeTokenTransfer(
    address,
    address,
    uint256
  ) internal {}

  function _afterTokenTransfer(
    address sender,
    address,
    uint256
  ) internal {
    _zeroMinimumBalances(sender);
  }

  function updateAccumulatedRate() public override returns (uint256) {
    accumulatedRates = currentAccumulatedRate();
    lastInterestRateUpdate = block.timestamp;
    return accumulatedRates;
  }

  function rebase() public override returns (uint256 mintedTokens) {
    updateAccumulatedRate();
    uint256 mappedTokens = denormalize(normalizedTotalSupply);
    uint256 tokenBalance = BLU.balanceOf(address(this));
    if (tokenBalance < mappedTokens) {
      mintedTokens = mappedTokens - tokenBalance;
      treasury.mint(address(this), mintedTokens);
    }
  }

  // View functions
  function currentAccumulatedRate() public view override returns (uint256) {
    require(block.timestamp >= lastInterestRateUpdate, "Invalid timestamp");
    return
      (compoundedInterest(block.timestamp - lastInterestRateUpdate) *
        accumulatedRates) / RAY;
  }

  function denormalize(uint256 amount) public view override returns (uint256) {
    return (amount * currentAccumulatedRate()) / RAY;
  }

  function normalize(uint256 amount) public view override returns (uint256) {
    return (amount * RAY) / currentAccumulatedRate();
  }

  function compoundedInterest(uint256 timePeriod)
    public
    view
    override
    returns (uint256)
  {
    return rpow(interestRate, timePeriod, RAY);
  }

  // Admin functions
  function setInterestRate(uint256 _interestRate) public override onlyOwner {
    require(_interestRate >= RAY, "Interest rate less than 1");
    interestRate = _interestRate;
  }

  function setMinimumNormalizedBalance(uint256 _minimumNormalizedBalance)
    public
    override
    onlyOwner
  {
    require(_minimumNormalizedBalance <= WAD, "Minimum balance greater than 1");
    minimumNormalizedBalance = _minimumNormalizedBalance;
  }

  // Math
  function rpow(
    uint256 x,
    uint256 n,
    uint256 base
  ) internal pure returns (uint256 z) {
    assembly {
      switch x
      case 0 {
        switch n
        case 0 {
          z := base
        }
        default {
          z := 0
        }
      }
      default {
        switch mod(n, 2)
        case 0 {
          z := base
        }
        default {
          z := x
        }
        let half := div(base, 2) // for rounding.
        for {
          n := div(n, 2)
        } n {
          n := div(n, 2)
        } {
          let xx := mul(x, x)
          if iszero(eq(div(xx, x), x)) {
            revert(0, 0)
          }
          let xxRound := add(xx, half)
          if lt(xxRound, xx) {
            revert(0, 0)
          }
          x := div(xxRound, base)
          if mod(n, 2) {
            let zx := mul(z, x)
            if and(iszero(iszero(x)), iszero(eq(div(zx, x), z))) {
              revert(0, 0)
            }
            let zxRound := add(zx, half)
            if lt(zxRound, zx) {
              revert(0, 0)
            }
            z := div(zxRound, base)
          }
        }
      }
    }
  }
}
