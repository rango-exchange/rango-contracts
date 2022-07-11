// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types/runtime";
import { networkConfig } from "../network.config";
import {
  CBRIDGE_MESSAGE_BUS_ABI,
  chainId,
  Contracts,
  getContract,
  NATIVE_ADDRESS,
  printContracts,
  getSwapRequest,
  getSwaps,
} from "../scripts/common";
import { BigNumber } from "ethers";
import { cBridgeMessageBusABI } from "../scripts/abi/cbridgeMessageBus.abi";
import { getAllMultichainRouters, getTokenInfo } from "../scripts/multichain";

async function setMultichainRouters(hre: HardhatRuntimeEnvironment) {
  const rangoMultichain = await getContract(hre, Contracts.RANGO_MULTICHAIN);
  const routers = await getAllMultichainRouters(chainId());
  console.log(
    `Multichain routers whitelisted, chain: ${chainId()}, routers: ${
      routers.length
    }`
  );
  await (await rangoMultichain.addMultichainRouters(routers)).wait(2);
}

export async function setFeeWalletOnlyRango(hre: HardhatRuntimeEnvironment) {
  const rangoV1 = await getContract(hre, Contracts.RANGO_V1);
  const { feeWallet } = networkConfig[chainId()];

  await (await rangoV1.updateFeeContractAddress(feeWallet)).wait(1);
}

export async function whiteListContracts(hre: HardhatRuntimeEnvironment, rango: boolean, cbridge: boolean) {
  const rangoV1 = await getContract(hre, Contracts.RANGO_V1);
  const rangoCBridge = await getContract(hre, Contracts.RANGO_CBRIDGE);
  const { validContracts, validMessagingDApps } = networkConfig[chainId()];
  for (const c of validContracts) {
    if (rango) {
        console.log(`whitelisting ${c} for rangoV1 ...`);
        await (await rangoV1.addWhitelist(c)).wait(2);
    }
    if (cbridge) {
        console.log(`whitelisting ${c} for rangoCBridge ...`);
        await (await rangoCBridge.addWhitelist(c, false)).wait(2);
    }
  }
  for (const c of validMessagingDApps) {
    if (cbridge) {
        console.log(`whitelisting dapp ${c} for rangoCBridge ...`);
        await (await rangoCBridge.addWhitelist(c, true)).wait(2);
    }
  }
}

async function setCBridge(hre: HardhatRuntimeEnvironment) {
  const rangoCBridge = await getContract(hre, Contracts.RANGO_CBRIDGE);
  const rangoV1 = await getContract(hre, Contracts.RANGO_V1);
  const { cBridgeContract, cBridgeIMMessageBus } = networkConfig[chainId()];

  const tx1 = await rangoCBridge.updateCBridgeAddress(cBridgeContract);
  await tx1.wait(1);
  console.log(`cBridge contract address set to ${cBridgeContract}`);

  const tx2 = await rangoCBridge.updateCBridgeMessageBusSenderAddress(
    cBridgeIMMessageBus
  );
  await tx2.wait(1);
  console.log(`cBridge message bus set to ${cBridgeIMMessageBus}`);

  const tx3 = await rangoV1.updateRangoCBridgeAddress(rangoCBridge.address);
  await tx3.wait(1);
  console.log(`RangoV1.updateRangoCBridgeAddress => ${rangoCBridge.address}`);
}

async function doOnChainSwap(hre: HardhatRuntimeEnvironment) {
  const rangoV1 = await getContract(hre, Contracts.RANGO_V1);
  const {
    affiliatorFee,
    affiliatorWallet,
    amountOutMin,
    rangoFee,
    swapPath,
    token1Address,
    token1SwapAmount,
    token2Address,
    uniswapDexSample,
  } = await getSwapRequest(hre, "token1SwapAmount");
  const isSourceNative = false;
  const isDestNative = true;

  const swaps = getSwaps(
    rangoV1.address,
    amountOutMin,
    swapPath,
    token1SwapAmount,
    uniswapDexSample,
    isSourceNative,
    isDestNative
  );
  const value = isSourceNative
    ? ethers.BigNumber.from(token1SwapAmount).add(
        ethers.BigNumber.from(rangoFee).add(
          ethers.BigNumber.from(affiliatorFee)
        )
      )
    : ethers.BigNumber.from("0");

  console.log(
    [
      isSourceNative ? NATIVE_ADDRESS : token1Address,
      isDestNative ? NATIVE_ADDRESS : token2Address,
      token1SwapAmount,
      rangoFee,
      affiliatorFee,
      affiliatorWallet,
    ],
    swaps,
    true,
    { value }
  );
  const tx = await rangoV1.onChainSwaps(
    [
      isSourceNative ? NATIVE_ADDRESS : token1Address,
      isDestNative ? NATIVE_ADDRESS : token2Address,
      token1SwapAmount,
      rangoFee,
      affiliatorFee,
      affiliatorWallet,
    ],
    swaps,
    true,
    { value }
  );
  await tx.wait(1);
  console.log("Swapped successfully");
}

async function doOnChainSwapAndCbridgeIM(
  hre: HardhatRuntimeEnvironment,
  isNative: boolean
) {
  const rangoV1 = await getContract(hre, Contracts.RANGO_V1);
  const {
    affiliatorFee,
    affiliatorWallet,
    amountOutMin,
    rangoFee,
    swapPath,
    token1Address,
    token1SwapAmount,
    token2Address,
    uniswapDexSample,
  } = await getSwapRequest(hre, "token1BridgeAmount");

  const swaps = getSwaps(
    rangoV1.address,
    amountOutMin,
    swapPath,
    token1SwapAmount,
    uniswapDexSample,
    isNative
  );

  const { cBridgeDest, cBridgeIMMessageBus } = networkConfig[chainId()];

  const destPath = cBridgeDest.middleToken
    ? [cBridgeDest.fromToken, cBridgeDest.middleToken, cBridgeDest.toToken]
    : [cBridgeDest.fromToken, cBridgeDest.toToken];
  const destAppAddress = networkConfig[cBridgeDest.chainId].rangoCBridge;

  const { deployer } = await hre.getNamedAccounts();

  const imMessage = [
    cBridgeDest.chainId, // uint64 destChainId
    cBridgeDest.bridgeNativeOut, // bool bridgeNativeOut
    cBridgeDest.dexAddress, // address dex
    cBridgeDest.fromToken, // address fromToken
    cBridgeDest.toToken, // address toToken
    0, // uint amountOutMin
    destPath, // address[] path
    Math.floor(new Date().getTime() / 1000 + 1800), // unit deadline
    !!cBridgeDest.nativeOut, // bool nativeOut
    deployer, // address originalSender
    deployer, // address recipient

    ethers.utils.arrayify('0x'),
    NATIVE_ADDRESS,
    NATIVE_ADDRESS,
    // ethers.utils.arrayify('0x00000000000000000000000000000000000000000000000000000000000000010000000000000000000000007E8A8b130272430008eCa062419ACD8B423d339D'),
    // '0xF364d3181B66Feaa6BdDa3F846bf9a2699CBAe1E',
    // '0x2C9235EF15DE775A50081F857A14603d4851eCF2',
  ];

  const encodedImMessage = ethers.utils.defaultAbiCoder.encode(
    CBRIDGE_MESSAGE_BUS_ABI,
    imMessage
  );

  const messageBsContract = await ethers.getContractAt(
    cBridgeMessageBusABI,
    cBridgeIMMessageBus
  );
  const sgnFee = BigNumber.from(
    await messageBsContract.calcFee(encodedImMessage)
  ).mul(2);
  console.log({ sgnFee });

  const value = isNative
    ? ethers.BigNumber.from(token1SwapAmount).add(
        ethers.BigNumber.from(rangoFee).add(
          ethers.BigNumber.from(affiliatorFee).add(sgnFee)
        )
      )
    : sgnFee;

  const tx = await rangoV1.cBridgeIM(
    [
      !isNative ? token1Address : NATIVE_ADDRESS,
      token2Address,
      token1SwapAmount,
      rangoFee,
      affiliatorFee,
      affiliatorWallet,
    ],
    swaps,

    // cbridge params
    destAppAddress,
    cBridgeDest.chainId,
    Math.floor(new Date().getTime()),
    100_000, // 100_000 = 10% sllipage
    sgnFee,
    imMessage,
    { value }
  );
  await tx.wait(1);
}

async function doOnChainSwapAndMultichain(
  hre: HardhatRuntimeEnvironment,
  isNative: boolean
) {
  const { deployer } = await hre.getNamedAccounts();
  const rangoV1 = await getContract(hre, Contracts.RANGO_V1);
  const {
    affiliatorFee,
    affiliatorWallet,
    amountOutMin,
    rangoFee,
    swapPath,
    token1Address,
    token1SwapAmount,
    token2Address,
    uniswapDexSample,
  } = await getSwapRequest(hre, "token1BridgeAmount");

  const swaps = getSwaps(
    rangoV1.address,
    amountOutMin,
    swapPath,
    token1SwapAmount,
    uniswapDexSample,
    isNative
  );

  const value = isNative
    ? ethers.BigNumber.from(token1SwapAmount).add(
        ethers.BigNumber.from(rangoFee).add(
          ethers.BigNumber.from(affiliatorFee)
        )
      )
    : ethers.BigNumber.from(0);

  const tokenInfo = await getTokenInfo(chainId(), token2Address);
  if (!tokenInfo)
    throw new Error(
      `Token with address ${token2Address} not found in Multichain API`
    );

  const { multichainConfig } = networkConfig[chainId()];
  const { destChainId } = multichainConfig;
  const destConfig = tokenInfo.destChains[destChainId.toString()];
  if (destConfig?.type !== "STABLEV3")
    throw new Error("Only STABLEV3 is supported as destConfig.type");

  const underlyingTokenAddress =
    tokenInfo.underlying === false
      ? tokenInfo.address
      : tokenInfo.underlying.address;
  const actionType =
    tokenInfo.underlying === false
      ? 0 // 'OUT'
      : 1; // 'OUT_UNDERLYING'
  const nativeAddress = "0x0000000000000000000000000000000000000000";
  const tx = await rangoV1.multichainBridge(
    [
      !isNative ? token1Address : nativeAddress,
      token2Address,
      token1SwapAmount,
      rangoFee,
      affiliatorFee,
      affiliatorWallet,
    ],
    swaps,
    // multichain params
    [
      actionType,
      underlyingTokenAddress,
      destConfig.routerToken,
      deployer,
      destChainId,
    ],
    { value }
  );
  await tx.wait(1);
}

const func = async function (hre: HardhatRuntimeEnvironment) {
//   const rangoV1Address = await deployRangoV1(hre, true);
//   console.log({ rangoV1Address });
//
//   const rangoCBridgeAddress = await deployRangoCBridge(hre, true);
//   console.log({ rangoCBridgeAddress });

//   const rangoMultichainAddress = await deployMultichain(hre, false);
//   console.log({ rangoMultichainAddress });
//
//   await setMultichainRouters(hre);
//
//   await setFeeWalletOnlyRango(hre);
//   await whiteListContracts(hre, false, true);
//   await setCBridge(hre);

  // await doOnChainSwap(hre);
//   await doOnChainSwapAndCbridgeIM(hre, true);
  // await doOnChainSwapAndMultichain(hre, false);
  await printContracts(hre);
};

func.tags = ["rango-cbridge"];
export default func;