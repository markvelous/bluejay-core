import React, { ReactElement } from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { Home } from "./views/Home";
import { Vault } from "./views/Vault";
import { VaultStablecoinSelect } from "./views/VaultStablecoinSelect";
import { VaultDetails } from "./views/VaultDetails";
import { CollateralFaucet } from "./views/CollateralFaucet";

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
          <VaultStablecoinSelect />
        </Route>
        <Route exact path="/vault/:vaultAddr/:stablecoinAddr">
          <VaultDetails />
        </Route>
      </Switch>
    </BrowserRouter>
  );
};
