import React, { FunctionComponent, ButtonHTMLAttributes } from "react";

export interface ButtonProp extends ButtonHTMLAttributes<HTMLButtonElement> {
  btnWidth?: "auto" | "full";
  btnSize?: "sm" | "md" | "lg";
}

export const Button: FunctionComponent<ButtonProp> = (props) => {
  const { children, btnWidth = "auto", btnSize = "md" } = props;
  let px, py, text;
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
  return (
    <button
      type="button"
      className={`${
        btnWidth === "full" && "w-full text-center"
      } items-center ${px} ${py} ${text} border border-transparent leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-700 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-800`}
      {...props}
    >
      {children}
    </button>
  );
};
