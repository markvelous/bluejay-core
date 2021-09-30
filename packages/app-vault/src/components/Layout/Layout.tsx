import React, { FunctionComponent } from "react";
import { Navigation } from "../../components/Navigation";

export const Layout: FunctionComponent = ({ children }) => {
  return (
    <div className="min-h-screen bg-blue-600">
      <div className="relative overflow-hidden">
        <Navigation />
        <main>{children}</main>
      </div>
    </div>
  );
};
