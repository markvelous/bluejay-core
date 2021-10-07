import React, { ReactElement } from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { Home } from "./views/Home";
import { Vault } from "./views/Vault";
import { VaultDetails } from "./views/VaultDetails";
import { CollateralFaucet } from "./views/CollateralFaucet";
import { VaultPositionManager } from "./views/VaultPositionManager";
import { VaultSavingsManager } from "./views/VaultSavingsManager";

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
        <Route exact path="/vault/summary/:vaultAddr">
          <VaultDetails />
        </Route>
        <Route exact path="/vault/position/:vaultAddr/:collateralType">
          <VaultPositionManager />
        </Route>
        <Route exact path="/vault/savings/:vaultAddr">
          <VaultSavingsManager />
        </Route>
      </Switch>
    </BrowserRouter>
  );
};
