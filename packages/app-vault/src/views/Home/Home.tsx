import React, { FunctionComponent } from "react";
import { Layout } from "../../components/Layout";
import { Hero } from "./Hero";

export const Home: FunctionComponent = () => {
  return (
    <Layout>
      <div className="pt-10 bg-blue-600 sm:pt-16 lg:pt-8 lg:pb-14 lg:overflow-hidden">
        <Hero />
      </div>
    </Layout>
  );
};
