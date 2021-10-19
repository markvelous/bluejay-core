import { utils, BigNumber, Contract, constants } from "ethers";
import React, { FunctionComponent, useState } from "react";
import { useParams } from "react-router-dom";
import DSProxyAbi from "@bluejayfinance/contracts/abi/DSProxy.json";
import ProxyHelperAbi from "@bluejayfinance/contracts/abi/ProxyHelper.json";

import {
  collateralJoinAddress,
  getCollateral,
  getLiquidationAuctionAddress,
  proxyHelperAddress,
  stablecoinJoinAddress,
} from "../../fixtures/deployments";
import { useTypedContractCall } from "../../hooks/utils";

import LiquidationAuctionAbi from "@bluejayfinance/contracts/abi/LiquidationAuction.json";

import { Layout } from "../Layout";
import { bnToNum, exp } from "../../utils/number";
import { useContractFunctionCustom } from "../../hooks/useContractFunctionCustom";
import { useVault } from "../../hooks/useVault";
import { Button } from "../Button/Button";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ProxyHelperContract = new Contract(proxyHelperAddress, ProxyHelperAbi) as any;

interface HasAuctionDetails {
  auction: { id: number; needsRedo: boolean; price: BigNumber; collateralToSell: BigNumber; debtToRaise: BigNumber };
}
interface HasExecutionDetails {
  type: "BID_AUCTION" | "RESTART_AUCTION";
}
interface HasActions {
  restartAuction: () => void;
  bidOnAuction: (_collateralAmount: BigNumber) => void;
}
interface LoadingVaultState {
  state: "LOADING_VAULT";
}
interface AuctionDetailsLoadedState extends HasAuctionDetails, HasActions {
  state: "AUCTIONS_DETAIL_LOADED";
}
interface PendingExecution extends HasAuctionDetails, HasExecutionDetails {
  state: "PENDING_EXECUTION";
}
interface ExecutionSuccess extends HasAuctionDetails, HasExecutionDetails, HasActions {
  state: "SUCCESS_EXECUTION";
  type: "BID_AUCTION" | "RESTART_AUCTION";
}
interface LoadingAuctionDetailsState {
  state: "LOADING_AUCTIONS_DETAIL";
}
interface ErrorState {
  state: "ERROR";
}
type VaultsOnAuctionState =
  | LoadingVaultState
  | LoadingAuctionDetailsState
  | AuctionDetailsLoadedState
  | ErrorState
  | PendingExecution
  | ExecutionSuccess;

export const useVaultsOnAuction = ({ name, auctionId }: { name: string; auctionId: number }): VaultsOnAuctionState => {
  const vaultState = useVault();
  const proxyContract = new Contract(
    vaultState.state === "VAULT_FOUND" ? vaultState.vault : constants.AddressZero,
    DSProxyAbi
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) as any;
  const auctionDetailsState = useTypedContractCall<
    {
      needsRedo: boolean;
      price: BigNumber;
      collateralToSell: BigNumber;
      debtToRaise: BigNumber;
    } & Array<BigNumber>
  >({
    abi: new utils.Interface(LiquidationAuctionAbi),
    address: getLiquidationAuctionAddress(name),
    method: "getAuctionStatus",
    args: [auctionId],
  });
  const [executeType, setExecuteType] = useState<"BID_AUCTION" | "RESTART_AUCTION">("BID_AUCTION");
  const { state: executeState, send: sendExecute } = useContractFunctionCustom(proxyContract, "execute(address,bytes)");

  const restartAuction = async (): Promise<void> => {
    if (vaultState.state !== "VAULT_FOUND") throw new Error("No vault address");
    const tx = await ProxyHelperContract.populateTransaction.restartAuction(
      auctionId,
      getLiquidationAuctionAddress(name),
      stablecoinJoinAddress
    );
    setExecuteType("RESTART_AUCTION");
    sendExecute(proxyHelperAddress, tx.data);
  };

  const bidOnAuction = async (collateralAmount: BigNumber): Promise<void> => {
    if (vaultState.state !== "VAULT_FOUND") throw new Error("No vault address");
    if (auctionDetailsState.state !== "RESOLVED") throw new Error("No price");
    const tx = await ProxyHelperContract.populateTransaction.bidOnLiquidationAuction(
      auctionId,
      collateralAmount,
      auctionDetailsState.result.price,
      getLiquidationAuctionAddress(name),
      stablecoinJoinAddress,
      collateralJoinAddress
    );
    setExecuteType("BID_AUCTION");
    sendExecute(proxyHelperAddress, tx.data);
  };

  if (vaultState.state !== "VAULT_FOUND") return { state: "LOADING_VAULT" };
  if (auctionDetailsState.state == "UNRESOLVED") return { state: "LOADING_AUCTIONS_DETAIL" };

  const { needsRedo, price, collateralToSell, debtToRaise } = auctionDetailsState.result;
  const auction = { id: auctionId, needsRedo, price, collateralToSell, debtToRaise };

  if (executeState.status === "Mining")
    return {
      state: "PENDING_EXECUTION",
      type: executeType,
      auction,
    };
  if (executeState.status === "Success")
    return {
      state: "SUCCESS_EXECUTION",
      type: executeType,
      auction,
      restartAuction,
      bidOnAuction,
    };

  return {
    state: "AUCTIONS_DETAIL_LOADED",
    auction: { id: auctionId, needsRedo, price, collateralToSell, debtToRaise },
    restartAuction,
    bidOnAuction,
  };
};

export const LiquidationDetails: FunctionComponent<{
  collateral: { name: string; collateralType: string };
  auctionId: number;
}> = ({ collateral, auctionId }) => {
  const auctionDetails = useVaultsOnAuction({ name: collateral.name, auctionId });
  return (
    <Layout>
      {auctionDetails.state == "LOADING_AUCTIONS_DETAIL" && <div>Loading auctions details</div>}
      {auctionDetails.state == "AUCTIONS_DETAIL_LOADED" && (
        <div>
          <div>#{auctionDetails.auction.id}</div>
          <div>Requires Redo: {auctionDetails.auction.needsRedo.toString()}</div>
          <div>Current Price: {bnToNum(auctionDetails.auction.price, 27, 4)}</div>
          <div>Debt to raise: {bnToNum(auctionDetails.auction.debtToRaise, 45, 4)}</div>
          <div>Collateral to sell: {bnToNum(auctionDetails.auction.collateralToSell, 18, 4)}</div>
          {auctionDetails.auction.needsRedo && <Button onClick={auctionDetails.restartAuction}>Restart Auction</Button>}
          <Button onClick={() => auctionDetails.bidOnAuction(exp(18).mul(5))}>Bid</Button>
        </div>
      )}
    </Layout>
  );
};

export const LiquidationDetailsContainer: FunctionComponent = () => {
  const { collateralType, auctionId: auctionIdStr } = useParams<{ collateralType: string; auctionId: string }>();
  const collateral = getCollateral(collateralType);
  const auctionId = Number(auctionIdStr);

  if (!collateral || isNaN(auctionId)) return null;

  return <LiquidationDetails collateral={collateral} auctionId={auctionId} />;
};
