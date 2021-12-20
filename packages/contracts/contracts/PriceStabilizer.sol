// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./external/UniswapV2Library.sol";

interface IStablecoinEngine {
  function poolsInfo(address _pool)
    external
    view
    returns (
      address reserve,
      address stablecoin,
      address pool
    );

  function getReserves(address poolAddr)
    external
    view
    returns (uint256 stablecoinReserve, uint256 reserveReserve);

  function swap(
    address poolAddr,
    uint256 amountIn,
    uint256 minAmountOut,
    bool reserveForStablecoin
  ) external;
}

interface IPriceFeedOracle {
  function getPrice() external view returns (uint256 price);
}

contract PriceStabilizer is AccessControl {
  uint256 constant ONE = 10**18;
  bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
  bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

  IStablecoinEngine immutable stablecoinEngine;
  mapping(address => PoolInfo) public poolInfos;

  struct PoolInfo {
    address reserve;
    address stablecoin;
    address pool;
    address oracle;
  }

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
    onlyRole(MANAGER_ROLE)
  {
    require(poolInfos[pool].reserve == address(0), "Pool has been initialized");
    (address reserve, address stablecoin, ) = stablecoinEngine.poolsInfo(pool);
    poolInfos[pool] = PoolInfo({
      reserve: reserve,
      stablecoin: stablecoin,
      pool: pool,
      oracle: oracle
    });
  }

  function updateOracle(address pool, address oracle)
    public
    ifPoolExists(pool)
    onlyRole(MANAGER_ROLE)
  {
    poolInfos[pool].oracle = oracle;
  }

  // oracle quotes the price as number of stablecoin for reserve
  function updatePrice(
    address pool,
    uint256 amountIn,
    uint256 minAmountOut,
    bool stablecoinForReserve
  ) public ifPoolExists(pool) onlyRole(OPERATOR_ROLE) {
    (uint256 stablecoinReserve, uint256 reserveReserve) = stablecoinEngine
      .getReserves(pool);
    uint256 price = (stablecoinReserve * ONE) / reserveReserve;
    uint256 oraclePrice = IPriceFeedOracle(poolInfos[pool].oracle).getPrice();
    require(
      stablecoinForReserve ? oraclePrice >= price : oraclePrice <= price,
      "Swap direction is incorrect"
    );

    // Optimistically perform the swap, with slippage protection
    stablecoinEngine.swap(pool, amountIn, minAmountOut, stablecoinForReserve);

    (stablecoinReserve, reserveReserve) = stablecoinEngine.getReserves(pool);
    price = (stablecoinReserve * ONE) / reserveReserve;
    require(
      stablecoinForReserve ? oraclePrice >= price : oraclePrice <= price,
      "Excessive swap amount"
    );
  }
}
