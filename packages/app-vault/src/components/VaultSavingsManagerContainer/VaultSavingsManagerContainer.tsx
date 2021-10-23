import React, { FunctionComponent, useState } from "react";
import { useParams } from "react-router-dom";

import { Content, Layout } from "../Layout";
import { bnToNum, exp, toBigNumber } from "../../utils/number";
import { useSavingsManager, ReadyManagerStates, hasQueryResults } from "../../hooks/useSavingsManager";
import { Button } from "../Button/Button";
import { BigNumber } from "ethers";
import { hasWalletAddress, useUserContext } from "../../context/UserContext";
import { WalletConnectionRequired } from "../WalletConnectionRequired";
import { LoaderContent } from "../Loader";
import { negativeString, truncateAddress } from "../../utils/strings";
import { InfoLine, InputWithPercentage } from "../Forms";
import { BasicAlert } from "../Feedback";

interface SavingsState {
  debtInput: string;
  debtDelta: BigNumber;
}

export const ReadySavingsManager: FunctionComponent<{ savingsManager: ReadyManagerStates; vaultAddr: string }> = ({
  savingsManager,
  vaultAddr,
}) => {
  const [isDepositView, setIsDepositView] = useState(true);
  const [interestView, setInterestView] = useState<"DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY">("DAILY");
  const { annualSavingsRate, savings, isGrantedStablecoinAllowance, isProxyOwner, walletStablecoinBalance } =
    savingsManager;
  const [savingsState, setSavingsState] = useState<SavingsState>({
    debtInput: "",
    debtDelta: BigNumber.from(0),
  });
  const updateSavingsState = (debtInput: string): void => {
    const debtNum = debtInput === "-" ? 0 : Number(debtInput);
    if (isNaN(debtNum)) return;
    const debtDelta = toBigNumber(debtNum, 18);
    setSavingsState({
      debtDelta,
      debtInput,
    });
  };
  const handleTransferSavings = (): void => {
    if (savingsManager.state !== "READY" && savingsManager.state !== "TRANSFER_SUCCESS") return;
    savingsManager.transferSavings(savingsState.debtDelta);
  };
  const annualInterest = bnToNum(annualSavingsRate, 27, 8);
  const dailyInterest = Math.pow(annualInterest, 1 / 365);
  const weeklyInterest = Math.pow(dailyInterest, 7);
  const monthlyInterest = Math.pow(dailyInterest, 30);

  const simSavings = savings.add(savingsState.debtDelta);
  const simInterest = simSavings.mul(annualSavingsRate.sub(exp(27)));
  return (
    <Layout>
      <Content>
        <div className="text-blue-600 text-3xl">Vault @ {truncateAddress(vaultAddr)}</div>

        <div className="grid grid-cols-2 mt-8 gap-4">
          <div>
            <h2 className="text-2xl text-blue-600 mb-4">Savings Statistics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-200 border border-blue-300 rounded-lg p-4">
                <div className="text-sm text-blue-600">Total Deposits</div>
                <div className="mt-4 text-3xl text-blue-600">
                  {bnToNum(savings, 18, 4).toLocaleString()} <span className="text-xl">MMKT</span>
                </div>
              </div>
              <div className="bg-blue-200 border border-blue-300 rounded-lg p-4">
                <div className="text-sm text-blue-600">Annual Savings Rate</div>
                <div className="mt-4 text-3xl text-blue-600">
                  {(bnToNum(annualSavingsRate, 25, 4) - 100).toFixed(2)}%
                </div>
              </div>
              <div className="col-span-2 bg-blue-200 border border-blue-300 rounded-lg p-4">
                <div className="text-sm text-blue-600">Expected Interests</div>
                <div className="flex my-4">
                  <div
                    className={
                      interestView === "DAILY"
                        ? "bg-white rounded text-blue-600 py-1 px-2 mr-2 cursor-pointer"
                        : "text-gray-600 py-1 px-2 mr-2 cursor-pointer"
                    }
                    onClick={() => setInterestView("DAILY")}
                  >
                    Daily
                  </div>
                  <div
                    className={
                      interestView === "WEEKLY"
                        ? "bg-white rounded text-blue-600 py-1 px-2 mr-2 cursor-pointer"
                        : "text-gray-600 py-1 px-2 mr-2 cursor-pointer"
                    }
                    onClick={() => setInterestView("WEEKLY")}
                  >
                    Weekly
                  </div>
                  <div
                    className={
                      interestView === "MONTHLY"
                        ? "bg-white rounded text-blue-600 py-1 px-2 mr-2 cursor-pointer"
                        : "text-gray-600 py-1 px-2 mr-2 cursor-pointer"
                    }
                    onClick={() => setInterestView("MONTHLY")}
                  >
                    Monthly
                  </div>
                  <div
                    className={
                      interestView === "YEARLY"
                        ? "bg-white rounded text-blue-600 py-1 px-2 mr-2 cursor-pointer"
                        : "text-gray-600 py-1 px-2 mr-2 cursor-pointer"
                    }
                    onClick={() => setInterestView("YEARLY")}
                  >
                    Yearly
                  </div>
                </div>
                {interestView === "DAILY" && (
                  <div className="mt-4 text-3xl text-blue-600">
                    {(bnToNum(savings, 18, 4) * (dailyInterest - 1)).toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                    <span className="text-xl"> MMKT</span>
                  </div>
                )}
                {interestView === "WEEKLY" && (
                  <div className="mt-4 text-3xl text-blue-600">
                    {(bnToNum(savings, 18, 4) * (weeklyInterest - 1)).toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                    <span className="text-xl"> MMKT</span>
                  </div>
                )}
                {interestView === "MONTHLY" && (
                  <div className="mt-4 text-3xl text-blue-600">
                    {(bnToNum(savings, 18, 4) * (monthlyInterest - 1)).toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                    <span className="text-xl"> MMKT</span>
                  </div>
                )}
                {interestView === "YEARLY" && (
                  <div className="mt-4 text-3xl text-blue-600">
                    {(bnToNum(savings, 18, 4) * (annualInterest - 1)).toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                    <span className="text-xl"> MMKT</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-2xl text-blue-600 mb-4">Manage Your Savings</h2>
            {isProxyOwner && (
              <div className="rounded-lg bg-white p-4">
                <div className="flex">
                  <div
                    className={
                      isDepositView
                        ? "bg-gray-200 p-2 mr-2 my-2 rounded cursor-pointer text-blue-600"
                        : "p-2 mr-2 my-2 rounded cursor-pointer"
                    }
                    onClick={() => setIsDepositView(true)}
                  >
                    Deposit
                  </div>
                  <div
                    className={
                      !isDepositView
                        ? "bg-gray-200 p-2 mr-2 my-2 rounded cursor-pointer text-blue-600"
                        : "p-2 mr-2 my-2 rounded cursor-pointer"
                    }
                    onClick={() => setIsDepositView(false)}
                  >
                    Withdraw
                  </div>
                </div>
                {isDepositView && (
                  <>
                    <div className="flex justify-between items-end mb-2">
                      <div>Deposit MMKT into Vault</div>
                      <div className="text-sm text-gray-400">
                        Wallet Balance:{" "}
                        {bnToNum(walletStablecoinBalance, 18, 4).toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}{" "}
                        MMKT
                      </div>
                    </div>
                    <InputWithPercentage
                      value={savingsState.debtInput}
                      onInputChange={(input) => updateSavingsState(input)}
                      maxValue={bnToNum(walletStablecoinBalance, 18, 4)}
                    />
                  </>
                )}
                {!isDepositView && (
                  <>
                    <div className="flex justify-between items-end mb-2">
                      <div>Withdraw MMKT into Wallet</div>
                      <div className="text-sm text-gray-400">
                        Vault Balance:{" "}
                        {bnToNum(savings, 18, 4).toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}{" "}
                        MMKT
                      </div>
                    </div>
                    <InputWithPercentage
                      value={negativeString(savingsState.debtInput)}
                      onInputChange={(input) => updateSavingsState(negativeString(input))}
                      maxValue={bnToNum(savings, 18, 4)}
                    />
                  </>
                )}
                <div className="mt-6">Simulation</div>
                <InfoLine
                  label="Total Deposits"
                  value={`${bnToNum(simSavings).toLocaleString()} MMKT`}
                  info="Total savings after this transaction executes."
                />
                <InfoLine
                  label="Expected Annual Interest"
                  value={`${bnToNum(simInterest, 45, 4).toLocaleString()} MMKT`}
                  info="Expected annual interest earned on the current intrest rate."
                />

                {!isGrantedStablecoinAllowance && savingsManager.state === "READY" && (
                  <div className="mt-3 text-center">
                    <Button
                      scheme="secondary"
                      btnSize="lg"
                      btnWidth="full"
                      onClick={savingsManager.approveStablecoinSpendByProxy}
                    >
                      Approve Vault to Use MMKT
                    </Button>
                  </div>
                )}

                {isGrantedStablecoinAllowance && (
                  <div className="mt-3 text-center">
                    <Button scheme="secondary" btnSize="lg" btnWidth="full" onClick={handleTransferSavings}>
                      {savingsState.debtDelta.gte(0) ? "Deposit" : "Withdraw"}
                    </Button>
                  </div>
                )}
              </div>
            )}
            {!isProxyOwner && (
              <div className="rounded-lg bg-white p-4">
                <BasicAlert title="You are not the owner of this vault!" />
              </div>
            )}
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export const ConnectedVaultSavingsManager: FunctionComponent<{ userAddr: string; vaultAddr: string }> = ({
  userAddr,
  vaultAddr,
}) => {
  const savingsManager = useSavingsManager({ vaultAddr, userAddr });
  if (hasQueryResults(savingsManager)) {
    return <ReadySavingsManager savingsManager={savingsManager} vaultAddr={vaultAddr} />;
  }
  if (savingsManager.state === "PENDING_MULTICALL") {
    return (
      <Layout>
        <LoaderContent>Loading Vault Information...</LoaderContent>
      </Layout>
    );
  }
  return (
    <Layout>
      <Content>An unexpected error has occured</Content>
    </Layout>
  );
};

export const VaultSavingsManagerContainer: FunctionComponent = () => {
  const { vaultAddr } = useParams<{ vaultAddr: string }>();
  const userContext = useUserContext();

  if (hasWalletAddress(userContext)) {
    return <ConnectedVaultSavingsManager userAddr={userContext.walletAddress} vaultAddr={vaultAddr} />;
  }
  return <WalletConnectionRequired />;
};
