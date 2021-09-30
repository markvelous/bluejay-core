export declare const deployCore: ({ network, deploymentCache, transactionCache, }: {
    network: string;
    deploymentCache: string;
    transactionCache: string;
}) => Promise<{
    collateral: import("ethers").Contract;
    oracle: import("ethers").Contract;
    governanceToken: import("ethers").Contract;
    stablecoin: import("ethers").Contract;
    collateralType: string;
    collateralJoin: import("ethers").Contract;
    stablecoinJoin: import("ethers").Contract;
    ledger: import("ethers").Contract;
    savingsAccount: import("ethers").Contract;
    oracleRelayer: import("ethers").Contract;
    feesEngine: import("ethers").Contract;
    surplusAuction: import("ethers").Contract;
    debtAuction: import("ethers").Contract;
    accountingEngine: import("ethers").Contract;
    liquidationEngine: import("ethers").Contract;
    liquidationAuction: import("ethers").Contract;
    discountCalculator: import("ethers").Contract;
}>;
