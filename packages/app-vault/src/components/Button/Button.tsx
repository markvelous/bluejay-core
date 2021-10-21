import React, { FunctionComponent, ButtonHTMLAttributes } from "react";

export interface ButtonProp extends ButtonHTMLAttributes<HTMLButtonElement> {
  btnWidth?: "auto" | "full";
  btnSize?: "sm" | "md" | "lg";
  scheme?: "primary" | "secondary";
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const omit = (obj: any, omitKeys: string[]): any => {
  return Object.keys(obj).reduce((result, key) => {
    if (!omitKeys.includes(key)) {
      result[key] = obj[key];
    }
    return result;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }, {} as any);
};

export const Button: FunctionComponent<ButtonProp> = (props) => {
  const { children, btnWidth = "auto", btnSize = "md", scheme = "primary" } = props;
  let px, py, text, colors;
  switch (btnSize) {
    case "sm":
      px = "px-3";
      py = "py-2";
      text = "text-sm";
      break;
    case "md":
      px = "px-3";
      py = "py-2";
      text = "text-base";
      break;
    default:
      px = "px-6";
      py = "py-3";
      text = "text-base";
      break;
  }
  switch (scheme) {
    case "secondary":
      colors = "text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-800 border border-white";
      break;
    default:
      colors = "text-blue-600 bg-white hover:bg-gray-50 focus:ring-gray-100";
      break;
  }
  return (
    <button
      type="button"
      className={`${
        btnWidth === "full" && "w-full text-center"
      } items-center ${px} ${py} ${text} ${colors} border border-transparent leading-4 font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 `}
      {...omit(props, ["btnWidth", "btnSize", "scheme"])}
    >
      {children}
    </button>
  );
};
