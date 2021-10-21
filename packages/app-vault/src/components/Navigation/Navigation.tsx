import React, { Fragment, FunctionComponent } from "react";
import { Popover, Transition } from "@headlessui/react";
import { MenuIcon, XIcon } from "@heroicons/react/outline";
import logo from "./logo-400.png";
import { useUserContext, hasWalletAddress } from "../../context/UserContext";
import { useState } from "react";

export const UserProfile: FunctionComponent = () => {
  const [showMenu, setShowMenu] = useState(false);
  const userContext = useUserContext();

  const handleButtonClick = (): void => {
    if (userContext.state === "UNCONNECTED") return userContext.activateBrowserWallet();
    if (userContext.state === "WRONG_NETWORK") return userContext.switchNetwork();
    setShowMenu(!showMenu);
  };

  const disconnect = (): void => {
    if (!hasWalletAddress(userContext)) return;
    setShowMenu(false);
    userContext.deactivate();
  };

  const getButtonContent = (): string => {
    switch (true) {
      case userContext.state === "UNCONNECTED":
        return "Connect Wallet";
      case userContext.state === "WRONG_NETWORK":
        return "Switch Network";
      default:
        return "Wallet";
    }
  };

  return (
    <>
      <div className="bg-white rounded p-2 text-blue-600 font-semibold cursor-pointer" onClick={handleButtonClick}>
        {getButtonContent()}
      </div>
      <div
        className={`absolute z-20 top-20 right-0 bg-white border-blue-400 text-blue-600 p-2 border rounded ${
          showMenu ? "block" : "hidden"
        }`}
      >
        <div className="text-sm font-bold">Wallet Address:</div>
        {hasWalletAddress(userContext) && <div className="text-xs">{userContext.walletAddress}</div>}
        {!hasWalletAddress(userContext) && <div className="text-xs">Wallet Not Connected</div>}

        <div className="text-sm font-bold mt-2">Vault Address:</div>
        {userContext.state === "READY" && <div className="text-xs">{userContext.proxyAddress}</div>}
        {userContext.state === "DEPLOYING_PROXY" && <div className="text-xs">Deploying...</div>}
        {userContext.state !== "READY" && userContext.state !== "DEPLOYING_PROXY" && (
          <div className="text-xs">No Vault Found</div>
        )}

        {hasWalletAddress(userContext) && (
          <div className="mt-2 mb-2 text-center border-t border-blue-200 pt-4">
            <span
              className="text-sm cursor-pointer rounded w-auto font-bold text-center text-red-500 py-2 px-4 border border-gray-400"
              onClick={disconnect}
            >
              Disconnect
            </span>
          </div>
        )}
      </div>
    </>
  );
};

export const Navigation: FunctionComponent = () => {
  return (
    <Popover as="header" className="relative">
      <div className="bg-blue-600 pt-2 pb-2">
        <nav className="relative max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6" aria-label="Global">
          <div className="flex items-center flex-1">
            <div className="flex items-center justify-between w-full">
              <a href="/">
                <span className="sr-only">Workflow</span>
                <img className="h-10 w-auto sm:h-14" src={logo} alt="" />
              </a>
              <div className="-mr-2 flex items-center md:hidden">
                <Popover.Button className="bg-blue-600 rounded-md p-2 inline-flex items-center justify-center text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus-ring-inset focus:ring-white">
                  <span className="sr-only">Open main menu</span>
                  <MenuIcon className="h-6 w-6" aria-hidden="true" />
                </Popover.Button>
              </div>
              <div className="-mr-2 items-center hidden md:flex">
                <UserProfile />
              </div>
            </div>
          </div>
          <div className="hidden md:flex md:items-center md:space-x-6" />
          <div className="hidden md:flex md:items-center md:space-x-2 md:ml-4 text-white" />
        </nav>
      </div>

      <Transition
        as={Fragment}
        enter="duration-150 ease-out"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="duration-100 ease-in"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <Popover.Panel focus className="absolute top-0 inset-x-0 p-2 transition transform origin-top md:hidden">
          <div className="rounded-lg shadow-md bg-white ring-1 ring-black ring-opacity-5 overflow-hidden">
            <div className="px-5 pt-4 flex items-center justify-between">
              <img className="h-14 w-auto m-auto" src={logo} alt="" />
              <div className="-mr-2">
                <Popover.Button className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-600">
                  <span className="sr-only">Close menu</span>
                  <XIcon className="h-6 w-6" aria-hidden="true" />
                </Popover.Button>
              </div>
            </div>
            <div className="pt-5 pb-6">
              <div className="px-2 space-y-1" />
            </div>
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
};
