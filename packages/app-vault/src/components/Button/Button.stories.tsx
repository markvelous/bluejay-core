import React from "react";
import { withKnobs, select } from "@storybook/addon-knobs";
import { Button, ButtonProp } from "./Button";

export default {
  title: "Button",
  decorators: [withKnobs],
  component: Button,
  parameters: {
    info: { inline: true, header: false },
  },
};

export const ButtonStory: React.FunctionComponent = () => {
  const backgroundOpts = {
    White: "bg-white",
    Blue: "bg-blue-600",
    DarkBlue: "bg-blue-800",
  };
  const background = select("Background", backgroundOpts, "bg-blue-600");

  const widthOpts = {
    Auto: "auto",
    Full: "full",
  };
  const width = select("Width", widthOpts, "auto") as ButtonProp["btnWidth"];

  const sizeOpts = {
    Small: "sm",
    Medium: "md",
    Large: "lg",
  };
  const size = select("Size", sizeOpts, "sm") as ButtonProp["btnSize"];

  const schemeOpts = {
    Primary: "primary",
    Secondary: "secondary",
  };
  const scheme = select("Scheme", schemeOpts, "primary") as ButtonProp["scheme"];

  return (
    <div className={`${background} p-6`}>
      <h1 className="storybook-title text-white">Background color is {background}</h1>
      <Button btnWidth={width} btnSize={size} scheme={scheme}>
        Click Me
      </Button>
    </div>
  );
};
