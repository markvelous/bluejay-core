import React, { FunctionComponent, useState } from "react";
import { useParams } from "react-router-dom";

import { Layout } from "../Layout";
import { bnToNum, toBigNumber } from "../../utils/number";
import { useSavingsManager, ReadyManagerStates } from "../../hooks/useSavingsManager";
import { Button } from "../Button/Button";
import { BigNumber } from "ethers";

interface SavingsState {
  debtInput: string;
  debtDelta: BigNumber;
}

export const ReadySavingsManager: FunctionComponent<{ savingsManager: ReadyManagerStates }> = ({ savingsManager }) => {
  const { annualSavingsRate, savings, isGrantedStablecoinAllowance, isProxyOwner } = savingsManager;
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
  return (
    <Layout>
      <div>Annual Savings Rate: {((bnToNum(annualSavingsRate, 27, 4) - 1) * 100).toFixed(2)}%</div>
      <div>Savings: {bnToNum(savings, 18, 4)} MMKT</div>
      <input value={savingsState.debtInput} onChange={(e) => updateSavingsState(e.target.value)} />
      {!isProxyOwner && <div>Not vault owner!</div>}
      {isProxyOwner && !isGrantedStablecoinAllowance && savingsManager.state === "READY" && (
        <Button onClick={savingsManager.approveStablecoinSpendByProxy}>Approve MMKT</Button>
      )}
      <Button onClick={handleTransferSavings}>{savingsState.debtDelta.gte(0) ? "Deposit" : "Withdraw"}</Button>
    </Layout>
  );
};

export const VaultSavingsManagerContainer: FunctionComponent = () => {
  const { vaultAddr } = useParams<{ vaultAddr: string }>();
  const savingsManager = useSavingsManager({ vaultAddr });

  if (savingsManager.state === "UNCONNECTED") {
    return <div>Unconnected!</div>;
  }
  if (savingsManager.state === "WRONG_NETWORK") {
    return <div>Wrong network!</div>;
  }
  if (savingsManager.state === "PENDING_MULTICALL") {
    return <div>Loading...</div>;
  }
  if (
    savingsManager.state === "READY" ||
    savingsManager.state === "TRANSFER_SUCCESS" ||
    savingsManager.state === "PENDING_TRANSFER" ||
    savingsManager.state === "PENDING_APPROVAL"
  ) {
    return <ReadySavingsManager savingsManager={savingsManager} />;
  }
  return <div>Error!</div>;
};
