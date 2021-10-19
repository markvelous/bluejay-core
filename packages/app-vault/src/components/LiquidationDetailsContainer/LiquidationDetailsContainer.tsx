import React, { FunctionComponent, useState } from "react";
import { useParams } from "react-router-dom";

import { getCollateral } from "../../fixtures/deployments";
import { Layout } from "../Layout";
import { bnToNum, exp, toBigNumber } from "../../utils/number";
import { Button } from "../Button/Button";
import { useVaultsOnAuction, hasAuctionDetail, hasAuctionActions } from "../../hooks/useVaultsOnAuction";
import { BigNumber } from "@usedapp/core/node_modules/ethers";

export const LiquidationDetails: FunctionComponent<{
  collateral: { name: string; collateralType: string };
  auctionId: number;
}> = ({ collateral, auctionId }) => {
  const [bidInput, setBidInput] = useState<{
    collateralToBuyBn: BigNumber;
    collateralToBuyInput: string;
    stablecoinRequiredInput: string;
  }>({ collateralToBuyBn: BigNumber.from(0), collateralToBuyInput: "", stablecoinRequiredInput: "" });
  const auctionDetails = useVaultsOnAuction({ name: collateral.name, auctionId });
  const updateBid = (collateralInput: string): void => {
    const collateralNum = Number(collateralInput);
    if (isNaN(collateralNum)) return;
    if (!hasAuctionDetail(auctionDetails)) return;
    const collateralToBuyBn = toBigNumber(collateralNum);
    const stablecoinRequired = collateralToBuyBn.mul(auctionDetails.auction.price).div(exp(27));
    setBidInput({
      collateralToBuyInput: collateralInput,
      collateralToBuyBn,
      stablecoinRequiredInput: bnToNum(stablecoinRequired, 18, 4).toString(),
    });
  };

  return (
    <Layout>
      {auctionDetails.state == "LOADING_AUCTIONS_DETAIL" && <div>Loading auctions details</div>}
      {hasAuctionDetail(auctionDetails) && (
        <div>
          <div>#{auctionDetails.auction.id}</div>
          <div>Requires Redo: {auctionDetails.auction.needsRedo.toString()}</div>
          <div>Current Price: {bnToNum(auctionDetails.auction.price, 27, 4)}</div>
          <div>Debt to raise: {bnToNum(auctionDetails.auction.debtToRaise, 45, 4)}</div>
          <div>Collateral to sell: {bnToNum(auctionDetails.auction.collateralToSell, 18, 4)}</div>
          {auctionDetails.state === "AUCTIONS_DETAIL_LOADED" && auctionDetails.auction.needsRedo && (
            <Button onClick={auctionDetails.restartAuction}>Restart Auction</Button>
          )}
          {hasAuctionActions(auctionDetails) && (
            <div>
              <div>Collateral to Buy</div>
              <input value={bidInput.collateralToBuyInput} onChange={(e) => updateBid(e.target.value)} />
              <div>Stablecoin required: {bidInput.stablecoinRequiredInput} </div>
              <Button onClick={() => auctionDetails.bidOnAuction(bidInput.collateralToBuyBn)}>Bid</Button>
            </div>
          )}
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
