import React, { FunctionComponent } from "react";
import illustration from "./illustration.png";

export const Hero: FunctionComponent = () => {
  return (
    <div className="mx-auto max-w-7xl lg:px-8">
      <div className="lg:grid lg:grid-cols-2 lg:gap-8">
        <div className="mx-auto max-w-md px-4 sm:max-w-2xl sm:px-6 sm:text-center lg:px-0 lg:text-left lg:flex lg:items-center">
          <div className="lg:py-24">
            <h1 className="mt-4 text-4xl tracking-tight font-extrabold text-white sm:mt-5 sm:text-6xl lg:mt-6 xl:text-6xl">
              <span className="block">Money Without Borders</span>
            </h1>
            <p className="mt-3 text-base text-gray-100 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
              Stablecoin framework for all fiat currencies
            </p>
          </div>
        </div>
        <div className="mt-12 mb-8 lg:m-0 lg:mb-10 lg:relative">
          <div className="mx-auto max-w-md px-4 sm:max-w-2xl sm:px-6 lg:max-w-none lg:px-0">
            <img
              className="w-full lg:inset-y-0 lg:left-0 lg:w-full lg:h-auto lg:max-w-none"
              src={illustration}
              alt=""
            />
          </div>
        </div>
      </div>
    </div>
  );
};
