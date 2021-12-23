// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/AccessControl.sol";

import "./interface/IPriceStabilizer.sol";
import "./interface/IPriceFeedOracle.sol";
import "./interface/IStablecoinEngine.sol";

import "./external/UniswapV2Library.sol";

contract PriceStabilizer is AccessControl, IPriceStabilizer {
  uint256 constant WAD = 10**18;
  bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
  bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

  IStablecoinEngine immutable stablecoinEngine;
  mapping(address => PoolInfo) public poolInfos;

  modifier ifPoolExists(address pool) {
    require(
      poolInfos[pool].reserve != address(0),
      "Pool has not been initialized"
    );
    _;
  }

  constructor(address _stablecoinEngine) {
    stablecoinEngine = IStablecoinEngine(_stablecoinEngine);
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
  }

  function initializePool(address pool, address oracle)
    public
    override
    onlyRole(MANAGER_ROLE)
  {
    require(poolInfos[pool].reserve == address(0), "Pool has been initialized");
    (address reserve, address stablecoin, , ) = stablecoinEngine.poolsInfo(
      pool
    );
    poolInfos[pool] = PoolInfo({
      reserve: reserve,
      stablecoin: stablecoin,
      pool: pool,
      oracle: oracle
    });
  }

  function updateOracle(address pool, address oracle)
    public
    override
    ifPoolExists(pool)
    onlyRole(MANAGER_ROLE)
  {
    require(oracle != address(0), "Address cannot be 0");
    poolInfos[pool].oracle = oracle;
    emit UpdatedOracle(pool, oracle);
  }

  // oracle should quote the price as number of stablecoin for reserve
  function updatePrice(
    address pool,
    uint256 amountIn,
    uint256 minAmountOut,
    bool stablecoinForReserve
  )
    public
    override
    ifPoolExists(pool)
    onlyRole(OPERATOR_ROLE)
    returns (uint256 poolPrice, uint256 oraclePrice)
  {
    (uint256 stablecoinReserve, uint256 reserveReserve) = stablecoinEngine
      .getReserves(pool);
    poolPrice = (stablecoinReserve * WAD) / reserveReserve;
    oraclePrice = IPriceFeedOracle(poolInfos[pool].oracle).getPrice();
    require(
      stablecoinForReserve
        ? oraclePrice >= poolPrice
        : oraclePrice <= poolPrice,
      "Swap direction is incorrect"
    );

    stablecoinEngine.swap(pool, amountIn, minAmountOut, stablecoinForReserve);

    (stablecoinReserve, reserveReserve) = stablecoinEngine.getReserves(pool);
    poolPrice = (stablecoinReserve * WAD) / reserveReserve;
    require(
      stablecoinForReserve
        ? oraclePrice >= poolPrice
        : oraclePrice <= poolPrice,
      "Overcorrection"
    );

    emit UpdatePrice(pool, amountIn, minAmountOut, stablecoinForReserve);
  }
}
