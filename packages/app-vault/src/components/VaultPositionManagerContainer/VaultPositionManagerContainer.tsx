import { BigNumber } from "ethers";
import React, { FunctionComponent, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { hasWalletAddress, useUserContext } from "../../context/UserContext";
import { Collateral, collaterals, getCollateralFromName } from "../../fixtures/deployments";
import { LiquidationState, useLiquidateVault } from "../../hooks/useLiquidateVault";
import { ReadyManagerStates, usePositionManager, ManagerState } from "../../hooks/usePositionManager";
import { bnToNum, exp, toBigNumber } from "../../utils/number";
import { negativeString, truncateAddress } from "../../utils/strings";
import { Button } from "../Button/Button";
import { BasicAlert, BasicWarning } from "../Feedback";
import { InfoLine, InfoPanel, InputWithPercentage } from "../Forms";
import { Content, Layout } from "../Layout";
import { LoaderContent } from "../Loader";
import { WalletConnectionRequired } from "../WalletConnectionRequired";

interface MintingState {
  collateralInput: string;
  debtInput: string;
  collateralDelta: BigNumber;
  debtDelta: BigNumber;
}

const CollateralSelector: FunctionComponent<{ vaultAddr: string; selectedCollateral: string }> = ({
  selectedCollateral,
  vaultAddr,
}) => {
  return (
    <div className="flex">
      {collaterals.map((collateral, index) => {
        const isSelected = collateral.name.toLowerCase() == selectedCollateral.toLowerCase();
        return (
          <Link to={`/vault/position/${vaultAddr}/${collateral.name}`} key={index}>
            <div
              className={`flex items-center ${
                isSelected ? "bg-blue-600" : "bg-white"
              } border border-gray-300 rounded-3xl p-2 mr-2`}
            >
              <img src={collateral.logo} className="w-8 rounded-full" />
              <span className={`text-xl ${isSelected ? "text-white" : "text-blue-600"} px-2`}>{collateral.name}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export const ReadyPositionManager: FunctionComponent<{
  vaultAddr: string;
  positionManager: ReadyManagerStates;
  liquidateVault: LiquidationState;
  collateral: { name: string; collateralType: string; address: string };
  handleTransferCollateralAndDebt: (_collateralDelta: BigNumber, _debtDelta: BigNumber) => void;
}> = ({ vaultAddr, positionManager, collateral, handleTransferCollateralAndDebt, liquidateVault }) => {
  const [showMinting, setShowMinting] = useState(true);
  const [mintingState, setMintingState] = useState<MintingState>({
    collateralInput: "",
    debtInput: "",
    collateralDelta: BigNumber.from(0),
    debtDelta: BigNumber.from(0),
  });
  const updateMintingState = (collateralInput: string, debtInput: string): void => {
    const collateralNum = collateralInput === "-" ? 0 : Number(collateralInput);
    const debtNum = debtInput === "-" ? 0 : Number(debtInput);
    if (isNaN(collateralNum) || isNaN(debtNum)) return;
    const debtDelta = toBigNumber(debtNum, 18);
    const collateralDelta = toBigNumber(collateralNum, 18);
    setMintingState({
      debtDelta,
      debtInput,
      collateralDelta,
      collateralInput,
    });
  };
  const {
    oraclePrice,
    lockedCollateral,
    debt,
    collateralBalance,
    stablecoinBalance,
    positionCollateralizationRatio,
    annualStabilityFee,
    collateralizationRatio,
    isGrantedCollateralAllowance,
    isGrantedStablecoinAllowance,
    isProxyOwner,
    debtFloor,
  } = positionManager;

  const simTotalCollateralLocked = lockedCollateral.add(mintingState.collateralDelta);
  const simTotalCollateralValue = oraclePrice.mul(simTotalCollateralLocked);
  const maxStablecoinMintable = collateralizationRatio.gt(0)
    ? simTotalCollateralValue.div(collateralizationRatio).sub(debt)
    : BigNumber.from(0);
  const simTotalDebtDrawn = debt.add(mintingState.debtDelta);
  const simCollateralizationRatio = simTotalDebtDrawn.gt(0)
    ? simTotalCollateralValue.div(simTotalDebtDrawn)
    : BigNumber.from(0);
  const simLiquidationPrice = simTotalCollateralLocked.gt(0)
    ? simTotalDebtDrawn.mul(collateralizationRatio).div(simTotalCollateralLocked)
    : BigNumber.from(0);

  const handleCollateralApproval = (): void => {
    if (positionManager.state === "READY" || positionManager.state === "ERROR_READY") {
      positionManager.approveCollateralSpendByProxy();
    }
  };

  const handleStablecoinApproval = (): void => {
    if (positionManager.state === "READY" || positionManager.state === "ERROR_READY") {
      positionManager.approveStablecoinSpendByProxy();
    }
  };

  const handleClosePosition = (): void => {
    if (positionManager.state === "READY" || positionManager.state === "ERROR_READY") {
      positionManager.closePosition();
    }
  };

  const handleLiquidatePosition = (): void => {
    if (liquidateVault.state === "READY") {
      liquidateVault.liquidateVault(vaultAddr);
    }
  };

  const shouldClosePosition = simTotalDebtDrawn.lt(debtFloor.div(exp(27))) && debt.gt(0);
  const canLiquidateVault =
    simTotalDebtDrawn.gt(0) && simTotalCollateralValue.div(simTotalDebtDrawn).lt(collateralizationRatio);
  return (
    <Layout>
      <Content>
        <div className="text-blue-600 text-3xl">Vault @ {truncateAddress(vaultAddr)}</div>
        <div className="mt-6">
          <CollateralSelector selectedCollateral={collateral.name} vaultAddr={vaultAddr} />
        </div>
        <div className="flex gap-4 mt-10">
          <InfoPanel
            label="Oracle Price"
            value={`${bnToNum(oraclePrice, 27, 2)} MMKT`}
            info="This is the current price of collateral against the stablecoin on the system's oracle."
          />
          <InfoPanel
            label="Stability Fee"
            value={`${((bnToNum(annualStabilityFee, 27, 4) - 1) * 100).toFixed(2)}%`}
            info="Stability fee is the interest charged for minting the stablecoin. It's accrued automatically as part of your debt drawn."
          />
          <InfoPanel
            label="Collateralization Ratio"
            value={`${bnToNum(collateralizationRatio, 27, 2) * 100}%`}
            info="Collateralization ratio is the amount of collateral required to mint the stablecoin. This value is above 100% to ensure that the value of each stablecoin is backed by more collateral value. Collaterals with more price volatility command higher collateralization ratio. Values with ratio lower than the required risk being liquidated by keepers."
          />
          <InfoPanel
            label="Min. Debt"
            value={`${bnToNum(debtFloor, 45, 2).toLocaleString()} MMKT`}
            info="The vault cannot have debt less than the debt floor to prevent creation of small vaults that will be costly for keepers to liquidate."
          />
        </div>
        <div className="grid grid-cols-2 mt-8 gap-4">
          <div className="w-full">
            <h2 className="text-3xl text-blue-600 mb-4">Vault Positions</h2>
            <div className="border rounded-lg border-blue-300 bg-blue-200 p-4 h-80">
              <div className="text-blue-600 text-sm">Collaterals Deposited</div>
              <div className="text-blue-600 text-3xl my-6">
                {bnToNum(lockedCollateral, 18, 4)} <span className="text-2xl">{collateral.name}</span>
              </div>
              <div className="border-t border border-blue-300 my-6" />
              <InfoLine
                label="MMKT Debt"
                value={`${bnToNum(debt, 18, 4).toLocaleString()} MMKT`}
                info="Amount of MMKT owed to the system. Stability fee will be imposed on this number."
              />
              <InfoLine
                label="Value of Collateral"
                value={`${bnToNum(lockedCollateral.mul(oraclePrice), 45, 4).toLocaleString()} MMKT`}
                info="This is the value of the collateral relative to the stablecoin. It is calculated using the oracle price."
              />
              <InfoLine
                label="Collateralization Ratio"
                value={`${(bnToNum(positionCollateralizationRatio, 27, 4) * 100).toFixed(2)}%`}
                info="This is your vault's current collateralization ratio, if it falls below the required minimum collateralization ratio, your vault is at risk of being liquidated"
              />
            </div>
          </div>
          {isProxyOwner && (
            <div className="w-full">
              <h2 className="text-3xl text-blue-600 mb-4">Manage Your Vault</h2>
              <div className="border rounded-lg border-gray-300 bg-white p-4">
                <div className="flex">
                  <div
                    className={
                      showMinting
                        ? "bg-gray-200 p-2 mr-2 my-2 rounded cursor-pointer text-blue-600"
                        : "p-2 mr-2 my-2 rounded cursor-pointer"
                    }
                    onClick={() => setShowMinting(true)}
                  >
                    Deposit &amp; Mint
                  </div>
                  <div
                    className={
                      !showMinting
                        ? "bg-gray-200 p-2 mr-2 my-2 rounded cursor-pointer text-blue-600"
                        : "p-2 mr-2 my-2 rounded cursor-pointer"
                    }
                    onClick={() => setShowMinting(false)}
                  >
                    Withdraw &amp; Repay
                  </div>
                </div>
                {positionManager.state === "ERROR_READY" && (
                  <div className="mb-2">
                    <BasicAlert title={positionManager.errorMessage || "An unexpected error has occured"} />
                  </div>
                )}
                {shouldClosePosition && (
                  <div className="mb-2">
                    <BasicWarning title="Resulting vault will have debt below the minimum debt requirement. You may choose to close the position by repaying all the stablecoin debt and withdrawing all your collaterals. You may only do this when you have enough stablecoin balance." />
                  </div>
                )}
                {showMinting && (
                  <>
                    <div className="flex justify-between items-end mb-2">
                      <div>Deposit Collateral ({collateral.name})</div>
                      <div className="text-sm text-gray-400">
                        Wallet Balance: {bnToNum(collateralBalance, 18, 4).toLocaleString()} {collateral.name}
                      </div>
                    </div>
                    <InputWithPercentage
                      value={mintingState.collateralInput}
                      onInputChange={(input) => updateMintingState(input, mintingState.debtInput)}
                      maxValue={bnToNum(collateralBalance, 18, 4)}
                    />
                  </>
                )}

                {!showMinting && (
                  <>
                    <div className="flex justify-between items-end mb-2">
                      <div>Withdraw Collateral ({collateral.name})</div>
                      <div className="text-sm text-gray-400">
                        Vault Balance: {bnToNum(lockedCollateral, 18, 4).toLocaleString()} {collateral.name}
                      </div>
                    </div>
                    <InputWithPercentage
                      value={negativeString(mintingState.collateralInput)}
                      onInputChange={(input) => updateMintingState(negativeString(input), mintingState.debtInput)}
                      maxValue={bnToNum(lockedCollateral, 18, 4)}
                    />
                  </>
                )}

                {showMinting && (
                  <>
                    <div className="flex justify-between items-end mb-2 mt-4">
                      <div>MMKT to Mint</div>
                      <div className="text-sm text-gray-400">
                        Max Mintable: {bnToNum(maxStablecoinMintable, 18, 4).toLocaleString()} MMKT
                      </div>
                    </div>
                    <InputWithPercentage
                      value={mintingState.debtInput}
                      onInputChange={(input) => updateMintingState(mintingState.collateralInput, input)}
                      maxValue={bnToNum(maxStablecoinMintable, 18, 4)}
                      steps={[95, 75, 50, 25, 0]}
                    />
                  </>
                )}

                {!showMinting && (
                  <>
                    <div className="flex justify-between items-end mb-2 mt-4">
                      <div>MMKT to Repay</div>
                      <div className="text-sm text-gray-400">
                        Wallet Balance: {bnToNum(stablecoinBalance, 18, 4).toLocaleString()} MMKT
                      </div>
                    </div>
                    <InputWithPercentage
                      value={negativeString(mintingState.debtInput)}
                      onInputChange={(input) => updateMintingState(mintingState.collateralInput, negativeString(input))}
                      maxValue={bnToNum(stablecoinBalance, 18, 4)}
                    />
                  </>
                )}

                <div className="mt-6">Simulation</div>

                <InfoLine
                  value={`${bnToNum(simTotalCollateralLocked, 18, 4).toLocaleString()} ${collateral.name}`}
                  label="Total Collateral Locked"
                  info="This is the total amount of collaterals locked up after this transaction."
                />

                <InfoLine
                  value={`${bnToNum(simTotalCollateralValue, 45, 4).toLocaleString()} MMKT`}
                  label="Total Collateral Value"
                  info="This is the value of the collaterals after this transaction, using the current oracle price."
                />

                <InfoLine
                  value={`${bnToNum(simTotalDebtDrawn, 18, 4).toLocaleString()} MMKT`}
                  label="Total Debt Drawn"
                  info="This is the total stablecoin you owe to the system after this transaction."
                />

                <InfoLine
                  value={`${bnToNum(simCollateralizationRatio, 25, 4).toLocaleString()}%`}
                  label="Collateralization Ratio"
                  info="This is the value of your collateral divided by the debt. It needs to be above the minimum collateralization ratio to prevent your vault from being liquidated."
                />

                <InfoLine
                  value={`${bnToNum(simLiquidationPrice, 27, 4).toLocaleString()} MMKT/${collateral.name}`}
                  label="Liquidation Price"
                  info="This is the price of the collateral that your vault will risk being liquidated as it has fallen below the required collateralization ratio."
                />

                {!isGrantedStablecoinAllowance && (
                  <div className="mt-3 text-center">
                    <Button scheme="secondary" btnSize="lg" btnWidth="full" onClick={handleStablecoinApproval}>
                      {positionManager.state !== "PENDING_APPROVAL"
                        ? "Approve Vault to Use MMKT"
                        : "Pending approval..."}
                    </Button>
                  </div>
                )}

                {!isGrantedCollateralAllowance && (
                  <div className="mt-3 text-center">
                    <Button scheme="secondary" btnSize="lg" btnWidth="full" onClick={handleCollateralApproval}>
                      {positionManager.state !== "PENDING_APPROVAL"
                        ? `Approve Vault to Use ${collateral.name}`
                        : "Pending approval..."}
                    </Button>
                  </div>
                )}

                {isGrantedCollateralAllowance && isGrantedStablecoinAllowance && !shouldClosePosition && (
                  <div className="mt-3 text-center">
                    <Button
                      scheme="secondary"
                      btnSize="lg"
                      btnWidth="full"
                      onClick={() =>
                        handleTransferCollateralAndDebt(mintingState.collateralDelta, mintingState.debtDelta)
                      }
                    >
                      {positionManager.state !== "PENDING_TRANSFER"
                        ? `Deposit ${collateral.name} & Mint MMKT`
                        : "Waiting for transaction to be confirmed..."}
                    </Button>
                  </div>
                )}

                {shouldClosePosition && (
                  <div className="mt-3 text-center">
                    <Button scheme="secondary" btnSize="lg" btnWidth="full" onClick={handleClosePosition}>
                      {positionManager.state !== "PENDING_TRANSFER"
                        ? `Close Position`
                        : "Waiting for transaction to be confirmed..."}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
          {!isProxyOwner && (
            <div className="w-full">
              <h2 className="text-3xl text-blue-600 mb-4">Vault Keeping</h2>
              <div className="border rounded-lg border-gray-300 bg-white p-4">
                {positionManager.state === "ERROR_READY" && (
                  <div className="mb-2">
                    <BasicAlert title={positionManager.errorMessage || "An unexpected error has occured"} />
                  </div>
                )}
                <div>Vault Health</div>
                <InfoLine
                  value={`${bnToNum(collateralizationRatio, 25, 4).toLocaleString()}%`}
                  label="Required Collateralization Ratio"
                  info="This is required collateralization ratio for this type of collateral. "
                />
                <InfoLine
                  value={`${bnToNum(simCollateralizationRatio, 25, 4).toLocaleString()}%`}
                  label="Current Collateralization Ratio"
                  info="This is the value of the collateral divided by the debt. You may liquidate this vault if this falls below the minimum liquidation ratio."
                />
                {!isGrantedStablecoinAllowance && (
                  <div className="mt-3 text-center">
                    <Button scheme="secondary" btnSize="lg" btnWidth="full" onClick={handleStablecoinApproval}>
                      {positionManager.state !== "PENDING_APPROVAL"
                        ? "Approve MMKT for Liquidation"
                        : "Pending approval..."}
                    </Button>
                  </div>
                )}
                {canLiquidateVault && isGrantedStablecoinAllowance && (
                  <div className="mt-3 text-center">
                    <Button scheme="secondary" btnSize="lg" btnWidth="full" onClick={handleLiquidatePosition}>
                      {liquidateVault.state !== "PENDING"
                        ? `Liquidate Position`
                        : "Waiting for transaction to be confirmed..."}
                    </Button>
                  </div>
                )}
                {!canLiquidateVault && (
                  <div className="mt-3 text-center">
                    <Button scheme="secondary" btnSize="lg" btnWidth="full">
                      Vault Cannot be Liquidated
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Content>
    </Layout>
  );
};

const LoadingPositionManager: FunctionComponent = () => {
  return (
    <Layout>
      <LoaderContent>Loading Vault Information...</LoaderContent>
    </Layout>
  );
};

const InvalidCollateralPositionManager: FunctionComponent = () => {
  return (
    <Layout>
      <Content>
        <div className="text-center mt-28 flex flex-col items-center text-gray-800">
          <h2 className="my-16 text-blue-600 text-2xl">Invalid Collateral Type</h2>
        </div>
      </Content>
    </Layout>
  );
};

const ErrorPositionManager: FunctionComponent = () => {
  return (
    <Layout>
      <Content>
        <div className="text-center mt-28 flex flex-col items-center text-gray-800">
          <h2 className="my-16 text-blue-600 text-2xl">An Error Has Occurred</h2>
        </div>
      </Content>
    </Layout>
  );
};

export const VaultPositionManager: FunctionComponent<{
  positionManager: ManagerState;
  vaultAddr: string;
  liquidateVault: LiquidationState;
  collateral?: Collateral;
}> = ({ liquidateVault, positionManager, vaultAddr, collateral }) => {
  if (!collateral) return <InvalidCollateralPositionManager />;

  const handleTransferCollateralAndDebt = (collateralDelta: BigNumber, debtDelta: BigNumber): void => {
    if (
      positionManager.state !== "READY" &&
      positionManager.state !== "TRANSFER_SUCCESS" &&
      positionManager.state !== "ERROR_READY"
    )
      return;
    positionManager.transferCollateralAndDebt(collateralDelta, debtDelta);
  };

  if (positionManager.state === "PENDING_MULTICALL") {
    return <LoadingPositionManager />;
  }
  if (
    positionManager.state === "READY" ||
    positionManager.state === "TRANSFER_SUCCESS" ||
    positionManager.state === "PENDING_TRANSFER" ||
    positionManager.state === "PENDING_APPROVAL" ||
    positionManager.state === "ERROR_READY"
  ) {
    return (
      <ReadyPositionManager
        vaultAddr={vaultAddr}
        positionManager={positionManager}
        liquidateVault={liquidateVault}
        collateral={collateral}
        handleTransferCollateralAndDebt={handleTransferCollateralAndDebt}
      />
    );
  }
  return <ErrorPositionManager />;
};

const ConnectedVaultPositionManager: FunctionComponent<{ userAddr: string }> = ({ userAddr }) => {
  const { vaultAddr, collateralType } = useParams<{ vaultAddr: string; collateralType: string }>();
  const collateral = getCollateralFromName(collateralType);
  const positionManager = usePositionManager({ vaultAddr, collateral, userAddr });
  const liquidateVault = useLiquidateVault({ collateral });

  return (
    <VaultPositionManager
      positionManager={positionManager}
      liquidateVault={liquidateVault}
      collateral={collateral}
      vaultAddr={vaultAddr}
    />
  );
};

export const VaultPositionManagerContainer: FunctionComponent = () => {
  const userContext = useUserContext();
  if (hasWalletAddress(userContext)) {
    return <ConnectedVaultPositionManager userAddr={userContext.walletAddress} />;
  }
  return <WalletConnectionRequired />;
};
