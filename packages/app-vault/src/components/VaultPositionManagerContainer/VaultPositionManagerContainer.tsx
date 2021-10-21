import React, { FunctionComponent, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Popover } from "@headlessui/react";

import { getCollateralFromName, collaterals } from "../../fixtures/deployments";
import { Layout, Content } from "../Layout";
import { bnToNum, exp, toBigNumber } from "../../utils/number";
import { Button } from "../Button/Button";
import { usePositionManager, ReadyManagerStates } from "../../hooks/usePositionManager";
import { BigNumber } from "ethers";
import { useLiquidateVault } from "../../hooks/useLiquidateVault";
import { hasWalletAddress, useUserContext } from "../../context/UserContext";
import { WalletConnectionRequired } from "../WalletConnectionRequired";

interface MintingState {
  collateralInput: string;
  debtInput: string;
  collateralDelta: BigNumber;
  debtDelta: BigNumber;
}

const truncateAddress = (address: string): string => {
  return address.substr(0, 6) + "..." + address.substr(address.length - 5);
};

interface InfoPanelProp {
  value: string | number;
  label: string;
  info?: string;
}

const InfoPanel: FunctionComponent<InfoPanelProp> = ({ value, label, info }) => {
  return (
    <div className="flex bg-white rounded-md border border-gray-300 px-4 py-2 w-60 justify-between text-gray-600">
      <div>
        <span className="mr-2 text-gray-800">{value}</span>
        <span className="text-sm">{label}</span>
      </div>
      {info && (
        <Popover>
          <Popover.Button>ⓘ</Popover.Button>
          <Popover.Panel className="absolute z-10">
            <div className="bg-white border border-gray-300 rounded-sm py-1 px-2 text-xs max-w-md">{info}</div>
          </Popover.Panel>
        </Popover>
      )}
    </div>
  );
};

const VaultLineInfo: FunctionComponent<InfoPanelProp> = ({ value, label, info }) => {
  return (
    <Popover>
      <div className="flex justify-between text-sm">
        <div className="text-gray-700">
          {label}
          {info ? <Popover.Button className="mx-2 font-bold">ⓘ</Popover.Button> : null}
        </div>
        <div className="text-blue-700">{value}</div>
        <Popover.Panel className="absolute z-10">
          <div className="bg-white border border-gray-300 rounded-sm py-1 px-2 text-xs max-w-md">{info}</div>
        </Popover.Panel>
      </div>
    </Popover>
  );
};

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

const InputWithPercentage: FunctionComponent<{
  steps?: number[];
  value: string;
  maxValue: number;
  onInputChange: (_input: string) => void;
}> = ({ value, maxValue, onInputChange, steps = [100, 75, 50, 25, 0] }) => {
  const [showSteps, setShowSteps] = useState(false);
  const [stepText, setStepText] = useState(steps[0].toString());

  const setStep = (step: number): void => {
    onInputChange(`${((maxValue * step) / 100).toFixed()}`);
    setShowSteps(false);
    setStepText(`${step}%`);
  };

  const handleInputChange = (input: string): void => {
    onInputChange(input);
  };
  return (
    <div className="flex w-full border border-gray-600 rounded-lg items-center">
      <input
        className="rounded-l-lg flex-grow h-10 outline-none px-4"
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
      />
      <div className="bg-blue-600 text-white rounded-lg m-1 w-24 text-center" onClick={() => setShowSteps(!showSteps)}>
        {showSteps && (
          <div className="absolute grid-cols-1 bg-blue-600 w-24 p-2 rounded-lg divide-y divide-blue-500" style={{}}>
            {steps.map((step) => (
              <div key={step} className="p-1 text-center" onClick={() => setStep(step)}>
                {step}%
              </div>
            ))}
          </div>
        )}
        <div className="p-2">
          {stepText} <span className="text-sm">▼</span>
        </div>
      </div>
    </div>
  );
};

export const ReadyPositionManager: FunctionComponent<{
  vaultAddr: string;
  positionManager: ReadyManagerStates;
  collateral: { name: string; collateralType: string; address: string };
  handleTransferCollateralAndDebt: (_collateralDelta: BigNumber, _debtDelta: BigNumber) => void;
  handleClosePosition: () => void;
}> = ({ vaultAddr, positionManager, collateral, handleTransferCollateralAndDebt, handleClosePosition }) => {
  const liquidationState = useLiquidateVault({ collateral });
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
  } = positionManager;
  const maxStablecoinMintable = oraclePrice
    .mul(lockedCollateral.add(mintingState.collateralDelta))
    .div(exp(27))
    .sub(debt);
  return (
    <Layout>
      <Content>
        <div className="text-blue-600 text-3xl">Vault @ {truncateAddress(vaultAddr)}</div>
        <div className="flex gap-4 mt-6">
          <InfoPanel
            label="Stability Fee"
            value={`${((bnToNum(annualStabilityFee, 27, 4) - 1) * 100).toFixed(2)}%`}
            info="Stability fee is the interest charged for minting the stablecoin. It's accrued automatically as part of your debt drawn."
          />
          <InfoPanel
            label="Collateral Ratio"
            value={`${bnToNum(collateralizationRatio, 27, 2) * 100}%`}
            info="Collateralization ratio is the amount of collateral required to mint the stablecoin. This value is above 100% to ensure that the value of each stablecoin is backed by more collateral value. Collaterals with more price volatility command higher collateralization ratio. Values with ratio lower than the required risk being liquidated by keepers."
          />
        </div>
        <div className="mt-10">
          <CollateralSelector selectedCollateral={collateral.name} vaultAddr={vaultAddr} />
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
              <VaultLineInfo
                label="MMKT Debt"
                value={`${bnToNum(debt, 18, 4).toLocaleString()} MMKT`}
                info="Amount of MMKT owed to the system. Stability fee will be imposed on this number."
              />
              <VaultLineInfo
                label="Value of Collateral"
                value={`${bnToNum(lockedCollateral.mul(oraclePrice), 45, 4).toLocaleString()} MMKT`}
                info="This is the value of the collateral relative to the stablecoin. It is calculated using the oracle price."
              />
              <VaultLineInfo
                label="Collateralization Ratio"
                value={`${(bnToNum(positionCollateralizationRatio, 27, 4) * 100).toFixed(2)}%`}
                info="This is your vault's current collateralization ratio, if it falls below the required minimum collateralization ratio, your vault is at risk of being liquidated"
              />
            </div>
          </div>
          <div className="w-full">
            <h2 className="text-3xl text-blue-600 mb-4">Manage Your Vault</h2>
            <div className="border rounded-lg border-gray-300 bg-white p-4">
              <div className="flex justify-between items-end mb-2">
                <div>Deposit Collateral ({collateral.name})</div>
                <div className="text-sm text-gray-400">
                  Balance: {bnToNum(collateralBalance, 18, 4).toLocaleString()} {collateral.name}
                </div>
              </div>
              <InputWithPercentage
                value={mintingState.collateralInput}
                onInputChange={(input) => updateMintingState(input, mintingState.debtInput)}
                maxValue={bnToNum(collateralBalance, 18, 4)}
              />

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

              <div className="mt-6 text-center">
                <Button
                  scheme="secondary"
                  btnSize="lg"
                  btnWidth="full"
                  onClick={() => handleTransferCollateralAndDebt(mintingState.collateralDelta, mintingState.debtDelta)}
                >
                  Deposit {collateral.name} &amp; Mint MMKT
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Content>
      <div className="pt-10 bg-blue-600 sm:pt-16 lg:pt-8 lg:pb-14 lg:overflow-hidden">
        <h1>Position Manager</h1>

        <div className="mt-6">System Info</div>
        <div>
          Oracle Price: {bnToNum(oraclePrice, 27, 2)} MMKT/{collateral.name}{" "}
        </div>
        <div>Stability Fee: {((bnToNum(annualStabilityFee, 27, 4) - 1) * 100).toFixed(2)}%</div>
        <div>Minimum Collateralization Ratio: {bnToNum(collateralizationRatio, 27, 2) * 100}%</div>

        <div className="mt-6">Wallet</div>
        <div>
          {collateral.name} Balance: {bnToNum(collateralBalance, 18, 4)}
        </div>
        <div>MMKT Balance: {bnToNum(stablecoinBalance, 18, 4)}</div>

        <div className="mt-6">Vault</div>
        <div>
          Locked Collateral: {bnToNum(lockedCollateral, 18, 4)} {collateral.name}
        </div>
        <div>Debt: {bnToNum(debt, 18, 4)} MMKT</div>
        <div>Ratio: {bnToNum(positionCollateralizationRatio, 27, 4) * 100}%</div>

        {!isProxyOwner && <div>Not vault owner!</div>}
        {isProxyOwner && !isGrantedCollateralAllowance && (
          <Button
            onClick={() => {
              if (positionManager.state == "READY") positionManager.approveCollateralSpendByProxy();
            }}
          >
            Approve Collateral Spend
          </Button>
        )}
        {isProxyOwner && !isGrantedStablecoinAllowance && (
          <Button
            onClick={() => {
              if (positionManager.state == "READY") positionManager.approveStablecoinSpendByProxy();
            }}
          >
            Approve Stablecoin Spend
          </Button>
        )}
        {isProxyOwner && isGrantedCollateralAllowance && (
          <div>
            <div>Collateral Delta</div>
            <input
              value={mintingState.collateralInput}
              onChange={(e) => updateMintingState(e.target.value, mintingState.debtInput)}
            />
            <div>Debt Delta</div>
            <input
              value={mintingState.debtInput}
              onChange={(e) => updateMintingState(mintingState.collateralInput, e.target.value)}
            />
            <Button
              onClick={() => handleTransferCollateralAndDebt(mintingState.collateralDelta, mintingState.debtDelta)}
            >
              Mint
            </Button>
            <Button onClick={handleClosePosition}>Close Position</Button>
          </div>
        )}
        {!isProxyOwner && liquidationState.state == "READY" && (
          <Button onClick={() => liquidationState.liquidateVault(vaultAddr)}>Liquidate</Button>
        )}
      </div>
    </Layout>
  );
};

const LoadingPositionManager: FunctionComponent = () => {
  return (
    <Layout>
      <Content>
        <div className="text-center mt-28 flex flex-col items-center text-gray-800">
          <h2 className="my-16 text-blue-600 text-2xl">Loading Vault Information...</h2>
        </div>
      </Content>
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

const ConnectedVaultPositionManager: FunctionComponent<{ userAddr: string }> = ({ userAddr }) => {
  const { vaultAddr, collateralType } = useParams<{ vaultAddr: string; collateralType: string }>();
  const collateral = getCollateralFromName(collateralType);
  const positionManager = usePositionManager({ vaultAddr, collateral, userAddr });

  if (!collateral) return <InvalidCollateralPositionManager />;

  const handleTransferCollateralAndDebt = (collateralDelta: BigNumber, debtDelta: BigNumber): void => {
    if (positionManager.state !== "READY" && positionManager.state !== "TRANSFER_SUCCESS") return;
    positionManager.transferCollateralAndDebt(collateralDelta, debtDelta);
  };
  const handleClosePosition = (): void => {
    if (positionManager.state !== "READY" && positionManager.state !== "TRANSFER_SUCCESS") return;
    positionManager.closePosition();
  };
  if (positionManager.state === "PENDING_MULTICALL") {
    return <LoadingPositionManager />;
  }
  if (
    positionManager.state === "READY" ||
    positionManager.state === "TRANSFER_SUCCESS" ||
    positionManager.state === "PENDING_TRANSFER" ||
    positionManager.state === "PENDING_APPROVAL"
  ) {
    return (
      <ReadyPositionManager
        vaultAddr={vaultAddr}
        positionManager={positionManager}
        collateral={collateral}
        handleTransferCollateralAndDebt={handleTransferCollateralAndDebt}
        handleClosePosition={handleClosePosition}
      />
    );
  }
  return <ErrorPositionManager />;
};

export const VaultPositionManagerContainer: FunctionComponent = () => {
  const userContext = useUserContext();
  if (hasWalletAddress(userContext)) {
    return <ConnectedVaultPositionManager userAddr={userContext.walletAddress} />;
  }
  return <WalletConnectionRequired />;
};
