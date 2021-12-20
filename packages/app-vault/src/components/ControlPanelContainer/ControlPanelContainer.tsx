import React, { FunctionComponent } from "react";
import { Content, Layout } from "../Layout";

import { deployments } from "./deployments";

export const ControlPanelContainer: FunctionComponent = () => {
  return (
    <Layout>
      <Content>
        <div>Addresses</div>
        <div>BLU Token: {deployments.contracts.BluejayToken.address}</div>
        <div>DAI Token: {deployments.contracts.MockReserveToken.address}</div>
        <div>Uniswap (BLU/DAI): {deployments.contracts.IUniswapV2Pair.address}</div>
        <div>Bond Depository (DAI): {deployments.contracts.BondDepositoryImpl.address}</div>
      </Content>
    </Layout>
  );
};
