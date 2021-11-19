import React, { FunctionComponent } from "react";
import { XCircleIcon, ExclamationIcon, CheckCircleIcon } from "@heroicons/react/solid";

export const BasicAlert: FunctionComponent<{ title: string }> = ({ title }) => {
  return (
    <div className="rounded-md bg-red-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">{title}</h3>
        </div>
      </div>
    </div>
  );
};

export const BasicWarning: FunctionComponent<{ title: string }> = ({ title }) => {
  return (
    <div className="rounded-md bg-yellow-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">{title}</h3>
        </div>
      </div>
    </div>
  );
};

export const BasicSuccess: FunctionComponent<{ title: string }> = ({ title }) => {
  return (
    <div className="rounded-md bg-green-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-green-800">{title}</h3>
        </div>
      </div>
    </div>
  );
};
