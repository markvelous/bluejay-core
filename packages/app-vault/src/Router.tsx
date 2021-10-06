import React, { ReactElement } from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { Home } from "./views/Home";
import { Vault } from "./views/Vault";
import { VaultDetails } from "./views/VaultDetails";
import { CollateralFaucet } from "./views/CollateralFaucet";
import { VaultPositionManager } from "./views/VaultPositionManager";

export const Router = (): ReactElement => {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
        <Route exact path="/faucet">
          <CollateralFaucet />
        </Route>
        <Route exact path="/vault">
          <Vault />
        </Route>
        <Route exact path="/vault/:vaultAddr">
          <VaultDetails />
        </Route>
        <Route exact path="/vault/:vaultAddr/:collateralType">
          <VaultPositionManager />
        </Route>
      </Switch>
    </BrowserRouter>
  );
};
