/* eslint-disable import/no-default-export */
/* eslint-disable import/no-extraneous-dependencies */
import { ContractFactory } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployResult } from "hardhat-deploy/dist/types";

const getInitializerData = (
  ImplFactory: ContractFactory,
  args: unknown[]
): string => {
  const fragment = ImplFactory.interface.getFunction("initialize");
  return ImplFactory.interface.encodeFunctionData(fragment, args);
};

export const deployUupsProxy = async ({
  factory,
  hre,
  args = [],
  from,
}: {
  factory: string;
  hre: HardhatRuntimeEnvironment;
  from: string;
  factoryArgs?: any[];
  args?: any[];
}): Promise<DeployResult> => {
  const { address: implementationAddress } = await hre.deployments.deploy(
    factory,
    {
      from,
      args: [],
      log: true,
    }
  );
  const implementationFactory = await hre.ethers.getContractFactory(factory);
  const initializeData = args
    ? getInitializerData(implementationFactory, args)
    : "0x";
  const deployment = await hre.deployments.deploy(`${factory}Proxy`, {
    contract: "ERC1967Proxy",
    from,
    args: [implementationAddress, initializeData],
    log: true,
  });

  // Furnish with other artifacts
  const artifact = await hre.deployments.getArtifact(factory);
  const proxyImplementation = {
    ...artifact,
    address: deployment.address,
  };

  // Manually save the deployment
  hre.deployments.save(`${factory}Impl`, proxyImplementation);

  return deployment;
};
