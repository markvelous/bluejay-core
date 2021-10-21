import React, { FunctionComponent } from "react";

export const Content: FunctionComponent = ({ children }) => {
  return (
    <div className="pt-10 sm:pt-16 lg:pt-8 lg:pb-14 lg:overflow-hidden">
      <div className="mx-auto max-w-7xl lg:px-8">{children}</div>
    </div>
  );
};
