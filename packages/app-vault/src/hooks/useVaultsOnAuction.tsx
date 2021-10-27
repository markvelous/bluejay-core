import DSProxyAbi from "@bluejayfinance/contracts/abi/DSProxy.json";
import LiquidationAuctionAbi from "@bluejayfinance/contracts/abi/LiquidationAuction.json";
import ProxyHelperAbi from "@bluejayfinance/contracts/abi/ProxyHelper.json";
import { BigNumber, constants, Contract, utils } from "ethers";
import { useState } from "react";
import { useUserContext } from "../context/UserContext";
import {
  collateralJoinAddress,
  getLiquidationAuctionAddress,
  proxyHelperAddress,
  stablecoinJoinAddress
} from "../fixtures/deployments";
import { useContractFunctionCustom } from "./useContractFunctionCustom";
import { useTypedContractCall } from "./utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ProxyHelperContract = new Contract(proxyHelperAddress, ProxyHelperAbi) as any;

export interface HasAuctionDetails {
  auction: { id: number; needsRedo: boolean; price: BigNumber; collateralToSell: BigNumber; debtToRaise: BigNumber };
}
export interface HasExecutionDetails {
  type: "BID_AUCTION" | "RESTART_AUCTION";
}
export interface HasActions {
  restartAuction: () => void;
  bidOnAuction: (_collateralAmount: BigNumber) => void;
}
export interface LoadingVaultState {
  state: "LOADING_VAULT";
}
export interface AuctionDetailsLoadedState extends HasAuctionDetails, HasActions {
  state: "AUCTIONS_DETAIL_LOADED";
}
export interface PendingExecution extends HasAuctionDetails, HasExecutionDetails {
  state: "PENDING_EXECUTION";
}
export interface ExecutionSuccess extends HasAuctionDetails, HasExecutionDetails, HasActions {
  state: "SUCCESS_EXECUTION";
  type: "BID_AUCTION" | "RESTART_AUCTION";
}
export interface LoadingAuctionDetailsState {
  state: "LOADING_AUCTIONS_DETAIL";
}
export interface ErrorState {
  state: "ERROR";
}
export type VaultsOnAuctionState =
  | LoadingVaultState
  | LoadingAuctionDetailsState
  | AuctionDetailsLoadedState
  | ErrorState
  | PendingExecution
  | ExecutionSuccess;

export const hasAuctionDetail = (
  state: VaultsOnAuctionState
): state is AuctionDetailsLoadedState | PendingExecution | ExecutionSuccess => {
  return (
    state.state === "AUCTIONS_DETAIL_LOADED" ||
    state.state === "PENDING_EXECUTION" ||
    state.state === "SUCCESS_EXECUTION"
  );
};

export const hasAuctionActions = (
  state: VaultsOnAuctionState
): state is AuctionDetailsLoadedState | ExecutionSuccess => {
  return state.state === "AUCTIONS_DETAIL_LOADED" || state.state === "SUCCESS_EXECUTION";
};

export const useVaultsOnAuction = ({ name, auctionId }: { name: string; auctionId: number }): VaultsOnAuctionState => {
  const userContext = useUserContext();
  const proxyContract = new Contract(
    userContext.state === "READY" ? userContext.proxyAddress : constants.AddressZero,
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
    if (userContext.state !== "READY") throw new Error("No vault address");
    const tx = await ProxyHelperContract.populateTransaction.restartAuction(
      auctionId,
      getLiquidationAuctionAddress(name),
      stablecoinJoinAddress
    );
    setExecuteType("RESTART_AUCTION");
    sendExecute(proxyHelperAddress, tx.data);
  };

  const bidOnAuction = async (collateralAmount: BigNumber): Promise<void> => {
    if (userContext.state !== "READY") throw new Error("No vault address");
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

  if (userContext.state !== "READY") return { state: "LOADING_VAULT" };
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
