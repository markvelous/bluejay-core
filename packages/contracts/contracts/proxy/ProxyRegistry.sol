// proxy.sol - execute actions atomically through the proxy's identity

// Copyright (C) 2017  DappHub, LLC

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

pragma solidity >=0.8.0;

import "./DSProxy.sol";
import "./DSProxyFactory.sol";

// ProxyRegistry
// This Registry deploys new proxy instances through DSProxyFactory.build(address) and keeps a registry of owner => proxy
contract ProxyRegistry {
  mapping(address => DSProxy) public proxies;
  DSProxyFactory factory;

  constructor() {
    factory = new DSProxyFactory();
  }

  // deploys a new proxy instance
  // sets owner of proxy to caller
  function build() public returns (DSProxy proxy) {
    proxy = build(msg.sender);
  }

  // deploys a new proxy instance
  // sets custom owner of proxy
  function build(address owner) public returns (DSProxy proxy) {
    require(
      address(proxies[owner]) == address(0) || proxies[owner].owner() != owner
    ); // Not allow new proxy if the user already has one and remains being the owner
    proxy = DSProxy(factory.build(owner));
    proxies[owner] = proxy;
  }
}
