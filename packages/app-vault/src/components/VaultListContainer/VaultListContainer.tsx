import React, { FunctionComponent } from "react";
import { Layout } from "../Layout";
import { utils } from "ethers";
import { useTypedContractCall } from "../../hooks/utils";
import ProxyRegistryAbi from "@bluejayfinance/contracts/abi/ProxyRegistry.json";
import { proxyRegistryAddress } from "../../fixtures/deployments";
import { Link } from "react-router-dom";

export interface PendingProxyListState {
  state: "PENDING_PROXY_LIST";
}
export interface ResolvedProxyListState {
  state: "RESOLVED_PROXY_LIST";
  proxies: string[];
}
export type VaultListState = PendingProxyListState | ResolvedProxyListState;

export const useVaultList = (): VaultListState => {
  const proxyListState = useTypedContractCall<[string[]]>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    abi: new utils.Interface(ProxyRegistryAbi),
    address: proxyRegistryAddress,
    method: "listDeployedProxies",
    args: [],
  });
  const proxies = proxyListState.state === "RESOLVED" ? proxyListState.result[0] : [];

  if (proxyListState.state == "UNRESOLVED")
    return {
      state: "PENDING_PROXY_LIST",
    };

  return {
    state: "RESOLVED_PROXY_LIST",
    proxies,
  };
};

export const VaultListContainer: FunctionComponent = () => {
  const vaultListState = useVaultList();

  if (vaultListState.state === "PENDING_PROXY_LIST") {
    return <Layout>Loading...</Layout>;
  }
  return (
    <Layout>
      {vaultListState.proxies.map((proxyAddress, i) => (
        <div key={i}>
          <Link to={`/vault/summary/${proxyAddress}`}>{proxyAddress}</Link>
        </div>
      ))}
    </Layout>
  );
};
