import auctionAbi from "../../fixtures/abi/Auction.json";
import { BigNumber, Contract, utils } from "ethers";
import { useContractCall, useContractCalls, useContractFunction, useBlockNumber } from "@usedapp/core";
import { config } from "../../config";
import { exp } from "../../utils/number";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const auctionContract: any = new Contract(config.contractDeployments.auction, auctionAbi);

export const useAuctionPrice = (): undefined | BigNumber => {
  const res: undefined | BigNumber[] = useContractCall({
    abi: new utils.Interface(auctionAbi),
    address: config.contractDeployments.auction,
    method: "currentPrice",
    args: [],
  });

  const formattedPrice = res ? res[0].div(exp(27 - 18)) : res;

  return formattedPrice;
};

export const useBuyToken = (): ReturnType<typeof useContractFunction> => {
  return useContractFunction(auctionContract, "buyToken", { transactionName: "Buy Token" });
};

export const useAuctionStarted = (): { state: "LOADING" | "STARTED" | "NOT_STARTED"; startBlock?: number } => {
  const currentBlock = useBlockNumber();
  const startBlock: undefined | BigNumber[] = useContractCall({
    abi: new utils.Interface(auctionAbi),
    address: config.contractDeployments.auction,
    method: "startBlock",
    args: [],
  });
  if (!startBlock || !currentBlock) return { state: "LOADING" };
  return {
    state: currentBlock >= startBlock[0].toNumber() ? "STARTED" : "NOT_STARTED",
    startBlock: startBlock[0].toNumber(),
  };
};

export const useAuctionProgress = ():
  | {
      currentBlock: number;
      currentPeriod: number;
      blocksToNextPeriod: number;
      tokensLeft: BigNumber;
      blockAtNextPeriod: number;
    }
  | undefined => {
  const currentBlock = useBlockNumber();
  const [tokenPerPeriodRaw, lastTokenSoldInPeriodRaw, lastTransactedPeriodRaw, blocksPerPeriodRaw, startBlockRaw] =
    useContractCalls([
      {
        abi: new utils.Interface(auctionAbi),
        address: config.contractDeployments.auction,
        method: "tokenPerPeriod",
        args: [],
      },
      {
        abi: new utils.Interface(auctionAbi),
        address: config.contractDeployments.auction,
        method: "lastTokenSoldInPeriod",
        args: [],
      },
      {
        abi: new utils.Interface(auctionAbi),
        address: config.contractDeployments.auction,
        method: "lastTransactedPeriod",
        args: [],
      },
      {
        abi: new utils.Interface(auctionAbi),
        address: config.contractDeployments.auction,
        method: "blocksPerPeriod",
        args: [],
      },
      {
        abi: new utils.Interface(auctionAbi),
        address: config.contractDeployments.auction,
        method: "startBlock",
        args: [],
      },
    ]) as (BigNumber[] | undefined)[];
  if (!currentBlock) return undefined;
  if (!tokenPerPeriodRaw) return undefined;
  if (!lastTokenSoldInPeriodRaw) return undefined;
  if (!lastTransactedPeriodRaw) return undefined;
  if (!blocksPerPeriodRaw) return undefined;
  if (!startBlockRaw) return undefined;
  const blocksPerPeriod = blocksPerPeriodRaw[0].toNumber();
  const startBlock = startBlockRaw[0].toNumber();
  const lastTransactedPeriod = lastTransactedPeriodRaw[0].toNumber();
  const blocksToNextPeriod = blocksPerPeriod - ((currentBlock - startBlock) % blocksPerPeriod);
  const blockAtNextPeriod = blocksToNextPeriod + currentBlock;
  const currentPeriod = Math.floor((currentBlock - startBlock) / blocksPerPeriod);
  const tokensLeft =
    currentPeriod == lastTransactedPeriod
      ? tokenPerPeriodRaw[0].sub(lastTokenSoldInPeriodRaw[0])
      : tokenPerPeriodRaw[0];
  return { currentBlock, currentPeriod, blocksToNextPeriod, tokensLeft, blockAtNextPeriod };
};
