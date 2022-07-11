import { HardhatRuntimeEnvironment } from "hardhat/types";
import { networkConfig } from "../network.config";
import { chainId, Contracts, getContract } from "./common";

export async function deployRangoV1(
  hre: HardhatRuntimeEnvironment,
  force: boolean = false
): Promise<string> {
  const contractName = Contracts.RANGO_V1;
  const { deployments, getNamedAccounts } = hre;
  const { deployer } = await getNamedAccounts();

  const deps = await deployments.getOrNull(contractName);

  if (!force && deps) return deps.address;

  const weth = networkConfig[chainId()].wrappedToken;
  const rangoV1 = await deployments.deploy(contractName, {
    from: deployer,
    proxy: {
      proxyContract: "OptimizedTransparentProxy",
      execute: {
        init: {
          methodName: "initialize",
          args: [weth],
        },
      },
    },
    log: true,
  });

  console.log(`Deployed ${contractName} at ${rangoV1.address}`);
  return rangoV1.address;
}

export async function deployRangoCBridge(
  hre: HardhatRuntimeEnvironment,
  force: boolean = false
) {
  const contractName = Contracts.RANGO_CBRIDGE;
  const { deployments, getNamedAccounts } = hre;
  const { deployer } = await getNamedAccounts();

  const deps = await deployments.getOrNull(contractName);

  if (deps && !force) return deps.address;

  const weth = networkConfig[chainId()].wrappedToken;
  const rangoCBridge = await deployments.deploy(contractName, {
    from: deployer,
    args: [weth],
    log: true,
  });
  console.log(`Deployed ${contractName} at ${rangoCBridge.address}`);
  return rangoCBridge.address;
}

export async function deployRangoThorchain(
  hre: HardhatRuntimeEnvironment,
  force: boolean = false
) {
  const contractName = Contracts.RANGO_THORCHAIN;
  const { deployments, getNamedAccounts } = hre;
  const { deployer } = await getNamedAccounts();

  const deps = await deployments.getOrNull(contractName);

  if (deps && !force) return deps.address;

  const rangoThorchain = await deployments.deploy(contractName, {
    from: deployer,
    log: true,
  });
  console.log(`Deployed ${contractName} at ${rangoThorchain.address}`);
  return rangoThorchain.address;
}

export async function deployRangoThorchainOutputRouterUniV2(
  hre: HardhatRuntimeEnvironment
) {
  const contractName = Contracts.RANGO_THORCHAIN_OUTPUT_AGG_UNI_V2;
  const { deployments, getNamedAccounts } = hre;
  const { deployer } = await getNamedAccounts();

  const deps = await deployments.getOrNull(contractName);

  if (deps) return deps.address;

  const { wrappedToken, uniswapRouterV2 } = networkConfig[chainId()];
  const rangoThorchainUniV2 = await deployments.deploy(contractName, {
    from: deployer,
    args: [wrappedToken, uniswapRouterV2],
    log: true,
  });
  console.log(`Deployed ${contractName} at ${rangoThorchainUniV2.address}`);
  return rangoThorchainUniV2.address;
}

export async function deployRangoThorchainOutputRouterUniV3(
  hre: HardhatRuntimeEnvironment,
  v3PoolFee: number
) {
  if (!v3PoolFee || v3PoolFee <= 0) {
    throw new Error(`unexpected value for v3PoolFee: ${v3PoolFee}`);
  }

  const contractName = Contracts.RANGO_THORCHAIN_OUTPUT_AGG_UNI_V3;
  const { deployments, getNamedAccounts } = hre;
  const { deployer } = await getNamedAccounts();

  const deps = await deployments.getOrNull(contractName);

  if (deps) return deps.address;

  const { wrappedToken, uniswapRouterV3 } = networkConfig[chainId()];
  const rangoThorchainUniV3 = await deployments.deploy(contractName, {
    from: deployer,
    args: [wrappedToken, uniswapRouterV3, v3PoolFee],
    log: true,
  });
  console.log(`Deployed ${contractName} at ${rangoThorchainUniV3.address}`);
  return rangoThorchainUniV3.address;
}

export async function deployMultichain(
  hre: HardhatRuntimeEnvironment,
  force: boolean = false
) {
  const contractName = Contracts.RANGO_MULTICHAIN;
  const { deployments, getNamedAccounts } = hre;
  const { deployer } = await getNamedAccounts();

  const deps = await deployments.getOrNull(contractName);
  const rangoV1Deployment = await deployments.getOrNull(Contracts.RANGO_V1);
  const weth = networkConfig[chainId()].wrappedToken;

  if (!deps || force) {
    const rangoMultichain = await deployments.deploy(contractName, {
      from: deployer,
      args: [weth],
      log: true,
    });
    console.log(`Deployed ${contractName} at ${rangoMultichain.address}`);
  }

  const newContract = await deployments.getOrNull(contractName);
  if (!newContract)
    throw new Error("Invalid status, new deployed contract is still null");

  if (!rangoV1Deployment) throw new Error("RangoV1 is not deployed");

  const rangoV1 = await getContract(hre, Contracts.RANGO_V1);

  await (
    await rangoV1.updateRangoMultichainAddress(newContract.address)
  ).wait(1);
  console.log(`Set RangoV1.multichainAddress to ${newContract.address}`);

  return newContract.address;
}
