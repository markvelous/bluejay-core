import React, { FunctionComponent } from "react";
import { Popover } from "@headlessui/react";

interface InfoProp {
  value: string | number;
  label: string;
  info?: string;
}

export const InfoPanel: FunctionComponent<InfoProp> = ({ value, label, info }) => {
  return (
    <div className="bg-white rounded-md border border-gray-300 px-4 py-2 w-60 text-gray-600">
      <div className="flex justify-between">
        <span className="text-sm">{label}</span>
        {info && (
          <Popover>
            <Popover.Button>ⓘ</Popover.Button>
            <Popover.Panel className="absolute z-10">
              <div className="bg-white border border-gray-300 rounded-sm py-1 px-2 text-xs max-w-md">{info}</div>
            </Popover.Panel>
          </Popover>
        )}
      </div>
      <div>
        <span className="mr-2 text-gray-800">{value}</span>
      </div>
    </div>
  );
};

export const InfoLine: FunctionComponent<InfoProp> = ({ value, label, info }) => {
  return (
    <Popover>
      <div className="flex justify-between text-sm">
        <div className="text-gray-700">
          {label}
          {info ? <Popover.Button className="mx-2 font-bold">ⓘ</Popover.Button> : null}
        </div>
        <div className="text-blue-700">{value}</div>
        <Popover.Panel className="absolute z-10">
          <div className="bg-white border border-gray-300 rounded-sm py-1 px-2 text-xs max-w-md">{info}</div>
        </Popover.Panel>
      </div>
    </Popover>
  );
};
