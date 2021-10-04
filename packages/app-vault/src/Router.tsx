import React, { ReactElement } from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { Home } from "./views/Home";
import { Vault } from "./views/Vault";
import { VaultDetail } from "./views/VaultDetail";

export const Router = (): ReactElement => {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
        <Route exact path="/vault">
          <Vault />
        </Route>
        <Route exact path="/vault/:vaultAddr">
          <VaultDetail />
        </Route>
      </Switch>
    </BrowserRouter>
  );
};
