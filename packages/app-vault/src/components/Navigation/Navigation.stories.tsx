import React from "react";
import { Navigation } from "./Navigation";

export default {
  title: "Navigation",
  component: Navigation,
  parameters: {
    info: { inline: true, header: false },
  },
};

export const NavigationStory: React.FunctionComponent = () => (
  <div>
    <h1 className="storybook-title">Basic Navigation</h1>
    <Navigation />
  </div>
);
