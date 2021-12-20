// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./external/IUniswapV2Factory.sol";
import "./external/IUniswapV2Pair.sol";
import "./external/UniswapV2Library.sol";

interface ITreasury {
  function withdraw(
    address _token,
    address _to,
    uint256 _amount
  ) external;
}

interface IMintableBurnableERC20 is IERC20 {
  function mint(address _to, uint256 _amount) external;

  function burn(uint256 amount) external;
}

contract StablecoinEngine is
  Initializable,
  AccessControlUpgradeable,
  UUPSUpgradeable
{
  using SafeERC20 for IERC20;
  using SafeERC20 for IMintableBurnableERC20;
  uint256 constant WAD = 10**18;

  bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
  bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
  bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

  ITreasury public treasury;
  IUniswapV2Factory public poolFactory;

  mapping(address => mapping(address => address)) public pools; // pools[reserve][stablecoin] = liquidityPoolAddress
  mapping(address => StablecoinPoolInfo) public poolsInfo; // poolsInfo[liquidityPoolAddress] = StablecoinPoolInfo

  struct StablecoinPoolInfo {
    address reserve;
    address stablecoin;
    address pool;
  }

  event PoolAdded(
    address indexed reserve,
    address indexed stablecoin,
    address indexed pool
  );
  event LiquidityAdded(
    address indexed pool,
    uint256 liquidity,
    uint256 reserve,
    uint256 stablecoin
  );
  event LiquidityRemoved(
    address indexed pool,
    uint256 liquidity,
    uint256 reserve,
    uint256 stablecoin
  );

  modifier ifPoolExists(address pool) {
    require(poolsInfo[pool].reserve != address(0), "Pool has not been added");
    _;
  }

  function initialize(address _treasury, address factory) public initializer {
    __AccessControl_init();
    __UUPSUpgradeable_init();

    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    treasury = ITreasury(_treasury);
    poolFactory = IUniswapV2Factory(factory);
  }

  function _storePoolInfo(
    address reserve,
    address stablecoin,
    address pool
  ) internal {
    pools[reserve][stablecoin] = pool;
    poolsInfo[pool] = StablecoinPoolInfo({
      reserve: reserve,
      stablecoin: stablecoin,
      pool: pool
    });

    emit PoolAdded(reserve, stablecoin, pool);
  }

  // Function assumes that safety checks have been performed, use calculateAmounts to prevent liquidity sniping
  function _addLiquidity(
    address pool,
    uint256 reserveAmount,
    uint256 stablecoinAmount
  ) internal ifPoolExists(pool) returns (uint256 liquidity) {
    StablecoinPoolInfo memory info = poolsInfo[pool];
    IMintableBurnableERC20(info.stablecoin).mint(pool, stablecoinAmount);
    treasury.withdraw(info.reserve, pool, reserveAmount);
    liquidity = IUniswapV2Pair(pool).mint(address(this));
    IUniswapV2Pair(pool).transfer(address(treasury), liquidity);
    emit LiquidityAdded(pool, liquidity, reserveAmount, stablecoinAmount);
  }

  function _removeLiquidity(address pool, uint256 liquidity)
    internal
    ifPoolExists(pool)
    returns (uint256 reserveAmount, uint256 stablecoinAmount)
  {
    StablecoinPoolInfo memory info = poolsInfo[pool];
    IUniswapV2Pair(pool).transfer(address(pool), liquidity);
    IUniswapV2Pair(pool).burn(address(this));
    stablecoinAmount = IMintableBurnableERC20(info.stablecoin).balanceOf(
      address(this)
    );
    IMintableBurnableERC20(info.stablecoin).burn(stablecoinAmount);
    reserveAmount = IERC20(info.reserve).balanceOf(address(this));
    IERC20(info.reserve).safeTransfer(address(treasury), reserveAmount);
    emit LiquidityRemoved(pool, liquidity, reserveAmount, stablecoinAmount);
  }

  // Manager functions
  function initializeStablecoin(
    address reserve,
    address stablecoin,
    uint256 initialReserveAmount,
    uint256 initialStablecoinAmount
  ) public onlyRole(MANAGER_ROLE) returns (address poolAddress) {
    require(
      pools[reserve][stablecoin] == address(0),
      "Pool already initialized"
    );
    require(
      poolFactory.getPair(reserve, stablecoin) == address(0),
      "Pool already created"
    );
    poolAddress = poolFactory.createPair(reserve, stablecoin);
    _storePoolInfo(reserve, stablecoin, poolAddress);
    _addLiquidity(poolAddress, initialReserveAmount, initialStablecoinAmount);
  }

  function initializeExistingPool(address reserve, address stablecoin)
    public
    onlyRole(MANAGER_ROLE)
  {
    // Used in cases where pool has been created by someone else
    address pool = poolFactory.getPair(reserve, stablecoin);
    require(pool != address(0), "Pool not created");
    _storePoolInfo(reserve, stablecoin, pool);
  }

  function addLiquidity(
    address pool,
    uint256 reserveAmountDesired,
    uint256 stablecoinAmountDesired,
    uint256 reserveAmountMin,
    uint256 stablecoinAmountMin
  ) public onlyRole(MANAGER_ROLE) ifPoolExists(pool) {
    (uint256 reserveAmount, uint256 stablecoinAmount) = calculateAmounts(
      pool,
      reserveAmountDesired,
      stablecoinAmountDesired,
      reserveAmountMin,
      stablecoinAmountMin
    );
    _addLiquidity(pool, reserveAmount, stablecoinAmount);
  }

  function removeLiquidity(address pool, uint256 liquidity)
    public
    onlyRole(MANAGER_ROLE)
    ifPoolExists(pool)
  {
    _removeLiquidity(pool, liquidity);
  }

  // Operator functions
  function swap(
    address poolAddr,
    uint256 amountIn,
    uint256 minAmountOut,
    bool stablecoinForReserve
  ) public onlyRole(OPERATOR_ROLE) ifPoolExists(poolAddr) {
    StablecoinPoolInfo memory info = poolsInfo[poolAddr];
    IUniswapV2Pair pool = IUniswapV2Pair(poolAddr);
    (uint256 reserve0, uint256 reserve1, ) = pool.getReserves();
    (address token0, ) = UniswapV2Library.sortTokens(
      info.stablecoin,
      info.reserve
    );
    bool zeroForOne = stablecoinForReserve == (token0 == info.stablecoin);
    uint256 amountOut = UniswapV2Library.getAmountOut(
      amountIn,
      zeroForOne ? reserve0 : reserve1,
      zeroForOne ? reserve1 : reserve0
    );
    require(amountOut >= minAmountOut, "Insufficient output");

    if (stablecoinForReserve) {
      IMintableBurnableERC20(info.stablecoin).mint(poolAddr, amountIn);
    } else {
      treasury.withdraw(info.reserve, poolAddr, amountIn);
    }
    pool.swap(
      zeroForOne ? 0 : amountOut,
      zeroForOne ? amountOut : 0,
      stablecoinForReserve ? address(treasury) : address(this),
      new bytes(0)
    );

    if (!stablecoinForReserve) {
      IMintableBurnableERC20(info.stablecoin).burn(amountOut);
    }
  }

  function mint(
    address stablecoin,
    address to,
    uint256 amount
  ) public onlyRole(MINTER_ROLE) {
    IMintableBurnableERC20(stablecoin).mint(to, amount);
  }

  // TODO: sweep stray tokens to Treasury

  // View functions
  function calculateAmounts(
    address poolAddr,
    uint256 reserveAmountDesired,
    uint256 stablecoinAmountDesired,
    uint256 reserveAmountMin,
    uint256 stablecoinAmountMin
  ) public view returns (uint256 reserveAmount, uint256 stablecoinAmount) {
    IUniswapV2Pair pool = IUniswapV2Pair(poolAddr);
    (uint256 reserve0, uint256 reserve1, ) = pool.getReserves();

    if (reserve0 == 0 && reserve1 == 0) {
      (reserveAmount, stablecoinAmount) = (
        reserveAmountDesired,
        stablecoinAmountDesired
      );
    } else {
      StablecoinPoolInfo memory info = poolsInfo[poolAddr];
      (address token0, ) = UniswapV2Library.sortTokens(
        info.stablecoin,
        info.reserve
      );
      uint256 stablecoinAmountOptimal = token0 == info.stablecoin
        ? (reserveAmountDesired * reserve0) / reserve1
        : (reserveAmountDesired * reserve1) / reserve0;

      if (stablecoinAmountOptimal <= stablecoinAmountDesired) {
        require(
          stablecoinAmountOptimal >= stablecoinAmountMin,
          "Insufficient stablecoin"
        );
        (reserveAmount, stablecoinAmount) = (
          reserveAmountDesired,
          stablecoinAmountOptimal
        );
      } else {
        uint256 reserveAmountOptimal = token0 == info.stablecoin
          ? (stablecoinAmountDesired * reserve1) / reserve0
          : (stablecoinAmountDesired * reserve0) / reserve1;
        require(
          reserveAmountOptimal <= reserveAmountDesired,
          "Excessive reserve"
        );
        require(
          reserveAmountOptimal >= reserveAmountMin,
          "Insufficient reserve"
        );
        (reserveAmount, stablecoinAmount) = (
          reserveAmountOptimal,
          stablecoinAmountDesired
        );
      }
    }
  }

  function getReserves(address poolAddr)
    public
    view
    returns (uint256 stablecoinReserve, uint256 reserveReserve)
  {
    IUniswapV2Pair pool = IUniswapV2Pair(poolAddr);
    StablecoinPoolInfo memory info = poolsInfo[poolAddr];
    (uint256 reserve0, uint256 reserve1, ) = pool.getReserves();
    (address token0, ) = UniswapV2Library.sortTokens(
      info.stablecoin,
      info.reserve
    );
    if (poolsInfo[poolAddr].stablecoin == token0) {
      (stablecoinReserve, reserveReserve) = (reserve0, reserve1);
    } else {
      (stablecoinReserve, reserveReserve) = (reserve1, reserve0);
    }
  }

  // Required overrides
  function _authorizeUpgrade(address newImplementation)
    internal
    override
    onlyRole(MANAGER_ROLE)
  {}
}
