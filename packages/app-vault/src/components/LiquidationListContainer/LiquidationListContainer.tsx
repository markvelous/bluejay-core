import { utils, BigNumber } from "ethers";
import React, { FunctionComponent } from "react";
import { Link, useParams } from "react-router-dom";

import { getCollateral, getLiquidationAuctionAddress } from "../../fixtures/deployments";
import { useTypedContractCall, useTypedContractCalls } from "../../hooks/utils";

import LiquidationAuctionAbi from "@bluejayfinance/contracts/abi/LiquidationAuction.json";

import { Layout } from "../Layout";
import { bnToNum } from "../../utils/number";
// import { bnToNum, toBigNumber } from "../../utils/number";
// import { Button } from "../Button/Button";
// import { usePositionManager, ReadyManagerStates } from "../../hooks/usePositionManager";
// import { BigNumber } from "ethers";
// import { useLiquidateVault } from "../../hooks/useLiquidateVault";

type LoadingActiveAuctionState = {
  state: "LOADING_ACTIVE_AUCTIONS";
};
type LoadingAuctionDetailsState = {
  state: "LOADING_AUCTIONS_DETAIL";
};
type ErrorState = {
  state: "ERROR";
};
type AuctionDetailsLoadedState = {
  state: "AUCTIONS_DETAIL_LOADED";
  auctions: { id: number; needsRedo: boolean; price: BigNumber; collateralToSell: BigNumber; debtToRaise: BigNumber }[];
};
type VaultsOnAuctionState =
  | LoadingActiveAuctionState
  | LoadingAuctionDetailsState
  | AuctionDetailsLoadedState
  | ErrorState;

export const useVaultsOnAuction = ({ name }: { name: string }): VaultsOnAuctionState => {
  const activeAuctionsState = useTypedContractCall<BigNumber[][]>({
    abi: new utils.Interface(LiquidationAuctionAbi),
    address: getLiquidationAuctionAddress(name),
    method: "listActiveAuctions",
    args: [],
  });
  const auctionDetailsCall =
    activeAuctionsState.state == "RESOLVED"
      ? activeAuctionsState.result.map((activeAuctionId) => {
          return {
            abi: new utils.Interface(LiquidationAuctionAbi),
            address: getLiquidationAuctionAddress(name),
            method: "getAuctionStatus",
            args: [activeAuctionId[0]],
          };
        })
      : [];
  const auctionsDetailState = useTypedContractCalls<
    ({
      needsRedo: boolean;
      price: BigNumber;
      collateralToSell: BigNumber;
      debtToRaise: BigNumber;
    } & Array<BigNumber>)[]
  >(auctionDetailsCall);

  if (activeAuctionsState.state == "UNRESOLVED") return { state: "LOADING_ACTIVE_AUCTIONS" };
  if (activeAuctionsState.state == "RESOLVED" && auctionsDetailState.state == "UNRESOLVED")
    return { state: "LOADING_AUCTIONS_DETAIL" };

  if (activeAuctionsState.state == "RESOLVED" && auctionsDetailState.state == "RESOLVED") {
    const auctions = auctionsDetailState.result.map((auction, index) => {
      const id = activeAuctionsState.result[index][0].toNumber();
      const { needsRedo, price, collateralToSell, debtToRaise } = auction;
      return { id, needsRedo, price, collateralToSell, debtToRaise };
    });

    return { state: "AUCTIONS_DETAIL_LOADED", auctions };
  }

  return { state: "ERROR" };
};

export const LiquidationList: FunctionComponent<{ collateral: { name: string; collateralType: string } }> = ({
  collateral,
}) => {
  const auctionDetails = useVaultsOnAuction({ name: collateral.name });
  console.log(auctionDetails);
  return (
    <Layout>
      {auctionDetails.state == "LOADING_ACTIVE_AUCTIONS" && <div>Loading active auctions</div>}
      {auctionDetails.state == "LOADING_AUCTIONS_DETAIL" && <div>Loading auctions details</div>}
      {auctionDetails.state == "AUCTIONS_DETAIL_LOADED" &&
        auctionDetails.auctions.map((auction, index) => (
          <div key={index}>
            <Link to={`/vault/liquidation/${collateral.collateralType}/${auction.id}`}>
              <div>#{auction.id}</div>
              <div>Requires Redo: {auction.needsRedo.toString()}</div>
              <div>Current Price: {bnToNum(auction.price, 27, 4)}</div>
              <div>Debt to raise: {bnToNum(auction.debtToRaise, 45, 4)}</div>
              <div>Collateral to sell: {bnToNum(auction.collateralToSell, 18, 4)}</div>
            </Link>
          </div>
        ))}
    </Layout>
  );
};

export const LiquidationListContainer: FunctionComponent = () => {
  const { collateralType } = useParams<{ collateralType: string }>();
  const collateral = getCollateral(collateralType);

  if (!collateral) return null;

  return <LiquidationList collateral={collateral} />;
};
