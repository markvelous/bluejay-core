import React, { ReactElement } from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { Home } from "./views/Home";
import { ControlPanel } from "./views/ControlPanel";

export const Router = (): ReactElement => {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
        <Route exact path="/control-panel">
          <ControlPanel />
        </Route>
      </Switch>
    </BrowserRouter>
  );
};
