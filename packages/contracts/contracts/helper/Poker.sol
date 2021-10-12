pragma solidity >=0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IOracleSecurityModule {
  function updatePriceFeed() external;
}

interface IOracleRelayer {
  function updateCollateralPrice(bytes32 collateralType) external;
}

interface IFeesEngine {
  function updateAccumulatedRate(bytes32 collateralType)
    external
    returns (uint256 nextAccumulatedRate);
}

interface ISavingsAccount {
  function updateAccumulatedRate()
    external
    returns (uint256 nextAccumulatedRate);
}

interface IAccountingEngine {
  function popDebtDelay() external view returns (uint256 delay);

  function listPendingDebts() external view returns (uint256[] memory);

  function popDebtFromQueue(uint256 queueId) external;

  function debtQueue(uint256 queueId)
    external
    view
    returns (
      uint256 index,
      uint256 debt,
      uint256 timestamp
    );
}

contract Poker is Ownable {
  event PokeFail(string message);
  event PokeFail(string message, address addr);
  event PokeFail(string message, uint256 context);
  event PokeFail(string message, bytes32 context);

  IOracleRelayer oracleRelayer;
  IFeesEngine feesEngine;
  ISavingsAccount savingsAccount;
  IAccountingEngine accountingEngine;

  IOracleSecurityModule[] osms;
  bytes32[] collateralTypes;

  constructor(
    address oracleRelayerAddr,
    address feesEngineAddr,
    address savingsAccountAddr,
    address accountingEngineAddr
  ) {
    oracleRelayer = IOracleRelayer(oracleRelayerAddr);
    feesEngine = IFeesEngine(feesEngineAddr);
    savingsAccount = ISavingsAccount(savingsAccountAddr);
    accountingEngine = IAccountingEngine(accountingEngineAddr);
  }

  function addOracleSecurityModule(address osmsAddr) public onlyOwner {
    osms.push(IOracleSecurityModule(osmsAddr));
  }

  function addCollateralType(bytes32 collateralType) public onlyOwner {
    collateralTypes.push(collateralType);
  }

  function poke() public returns (bool success) {
    success = true;

    // Poke all the OSM
    for (uint256 i = 0; i < osms.length; i++) {
      IOracleSecurityModule osm = osms[i];
      try osm.updatePriceFeed() {} catch {
        success = false;
        emit PokeFail("osm.updatePriceFeed", address(osm));
      }
    }

    // For each of the collateral types, update oracle price and stability fees
    for (uint256 i = 0; i < collateralTypes.length; i++) {
      // Poke the oracle relayer to update price on ledger
      bytes32 collateralType = collateralTypes[i];
      try oracleRelayer.updateCollateralPrice(collateralType) {} catch {
        success = false;
        emit PokeFail("oracleRelayer.updateCollateralPrice", collateralType);
      }

      // Poke the fees engine to collect stability fee
      try feesEngine.updateAccumulatedRate(collateralType) {} catch {
        success = false;
        emit PokeFail("feesEngine.updateAccumulatedRate", collateralType);
      }
    }

    // Poke the savings account to pay out the interest
    try savingsAccount.updateAccumulatedRate() {} catch {
      success = false;
      emit PokeFail("savingsAccount.updateAccumulatedRate");
    }

    // Pop all matured debts in accounting engine
    uint256[] memory pendingDebts = accountingEngine.listPendingDebts();
    uint256 delay = accountingEngine.popDebtDelay();
    for (uint256 i = 0; i < pendingDebts.length; i++) {
      uint256 debtId = pendingDebts[i];
      (, , uint256 timestamp) = accountingEngine.debtQueue(debtId);
      if (timestamp + delay > block.timestamp) {
        try accountingEngine.popDebtFromQueue(debtId) {} catch {
          success = false;
          emit PokeFail("accountingEngine.popDebtFromQueue", debtId);
        }
      }
    }
  }
}
