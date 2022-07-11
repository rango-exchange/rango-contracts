import { HardhatRuntimeEnvironment } from "hardhat/types/runtime";
import { networkConfig } from "../network.config";
import {
  chainId,
  Contracts,
  getContract,
  NATIVE_ADDRESS,
  getSwapRequest,
  getSwaps,
} from "../scripts/common";
import {
  deployRangoCBridge,
  deployRangoThorchain,
  deployRangoThorchainOutputRouterUniV2,
  deployRangoThorchainOutputRouterUniV3,
  deployRangoV1,
} from "../scripts/creations";
import { BigNumber } from "ethers";
import { ethers, upgrades } from "hardhat";
import { setFeeWalletOnlyRango, whiteListContracts } from "./cbridge";
import { parseEther } from "ethers/lib/utils";

async function setThorchain(hre: HardhatRuntimeEnvironment) {
  const rangoThorchain = await getContract(hre, Contracts.RANGO_THORCHAIN);
  const rangoV1 = await getContract(hre, Contracts.RANGO_V1);

  const impl_addr = await upgrades.erc1967.getImplementationAddress(
    rangoV1.address
  );
  console.log("impl_addr", impl_addr);
  console.log("rangoV1", rangoV1.address);

  await (
    await rangoV1.updateRangoThorchainAddress(rangoThorchain.address)
  ).wait(1);

  console.log(
    `RangoV1.updateRangoThorchainAddress => ${rangoThorchain.address}`
  );
}

async function whiteListContractForThorchain(hre: HardhatRuntimeEnvironment) {
  const rangoThorchain = await getContract(hre, Contracts.RANGO_THORCHAIN);
  console.log("rangoThorchain", rangoThorchain.address);
  const thorchainRouter = networkConfig[chainId()].thorchainEthRouter;

  await (await rangoThorchain.addWhitelist(thorchainRouter)).wait(1);

  console.log(`RangoThorchain.addWhiteList => ${thorchainRouter}`);
}

async function doThorchainSimpleDeposit(hre: HardhatRuntimeEnvironment) {
  const rangoV1 = await getContract(hre, Contracts.RANGO_V1);

  // SwapRequest {
  //   address fromToken;
  //   address toToken;
  //   uint amountIn;
  //   uint feeIn;
  //   uint affiliateIn;
  //   address payable affiliatorAddress;
  // }
  const ethAmountInput = ethers.utils.parseEther("0.1");
  console.log({ ethAmountInput });
  const SwapRequestData = [
    NATIVE_ADDRESS,
    NATIVE_ADDRESS,
    ethAmountInput,
    "0",
    "0",
    NATIVE_ADDRESS,
  ];
  const swaps: any = [];

  const thorchainRouter = networkConfig[chainId()].thorchainEthRouter;
  const thorchainVault = "0xcf3932855383b96bf10bceaf7ff2efdf37bf709d";
  const thorchainMemo = "=:BNB.BNB:tbnb1afdvrfpls66n2hm58lx6je0yqmv5namf9f8fr2";

  // const isWhitelisted = await rangoV1.whitelistContracts(thorchainRouter);
  // console.log(`is router whitelisted ${isWhitelisted}`);
  // if (!isWhitelisted) {
  //   await (await rangoV1.addWhitelist(thorchainRouter)).wait(1);
  // }

  // swapInToThorchain(
  //   SwapRequest memory request,
  //   Call[] calldata calls,
  //   address tcRouter,
  //   address tcVault,
  //   string calldata thorchainMemo,
  //   uint expiration
  // )

  await (
    await rangoV1.swapInToThorchain(
      SwapRequestData,
      swaps,
      thorchainRouter,
      thorchainVault,
      thorchainMemo,
      Math.floor(new Date().getTime() / 1000 + 1800),
      { value: ethAmountInput }
    )
  ).wait(1);
}

async function swapAndDepositToThorchain(
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
  } = await getSwapRequest(hre, "token1SwapAmount");

  const swaps = getSwaps(
    rangoV1.address,
    amountOutMin,
    swapPath,
    token1SwapAmount,
    uniswapDexSample,
    isNative,
    false
  );

  const sgnFee = BigNumber.from("0");
  const value = isNative
    ? ethers.BigNumber.from(token1SwapAmount).add(
        ethers.BigNumber.from(rangoFee).add(
          ethers.BigNumber.from(affiliatorFee).add(sgnFee)
        )
      )
    : sgnFee;

  const SwapRequestData = [
    isNative ? NATIVE_ADDRESS : token1Address,
    token2Address,
    token1SwapAmount,
    rangoFee,
    affiliatorFee,
    affiliatorWallet,
  ];

  const thorchainRouter = networkConfig[chainId()].thorchainEthRouter;
  const thorchainVault = "0xddb1ec1c718cf5f274d2b72116dc08467f3ae228";
  const thorchainMemo = "=:BNB.BNB:tbnb1afdvrfpls66n2hm58lx6je0yqmv5namf9f8fr2";

  // const isWhitelisted = await rangoV1.whitelistContracts(thorchainRouter);
  // console.log(`is router whitelisted ${isWhitelisted}`);
  // if (!isWhitelisted) {
  //   await (await rangoV1.addWhitelist(thorchainRouter)).wait(1);
  // }

  // swapInToThorchain(
  //   SwapRequest memory request,
  //   Call[] calldata calls,
  //   address tcRouter,
  //   address tcVault,
  //   string calldata thorchainMemo,
  //   uint expiration
  // )
  await (
    await rangoV1.swapInToThorchain(
      SwapRequestData,
      swaps,
      thorchainRouter,
      thorchainVault,
      thorchainMemo,
      Math.floor(new Date().getTime() / 1000 + 1800),
      { value }
    )
  ).wait(1);
}

async function swapToNativeAndDepositToThorchain(
  hre: HardhatRuntimeEnvironment
) {
  const isInputNative = true;
  const isOutputNative = false;
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

  const swaps = getSwaps(
    rangoV1.address,
    amountOutMin,
    swapPath,
    token1SwapAmount,
    uniswapDexSample,
    isInputNative,
    isOutputNative
  );

  const sgnFee = BigNumber.from("0");
  const value = isInputNative
    ? ethers.BigNumber.from(token1SwapAmount).add(
        ethers.BigNumber.from(rangoFee).add(
          ethers.BigNumber.from(affiliatorFee).add(sgnFee)
        )
      )
    : sgnFee;

  const SwapRequestData = [
    isInputNative ? NATIVE_ADDRESS : token1Address,
    isOutputNative ? NATIVE_ADDRESS : token2Address,
    token1SwapAmount,
    rangoFee,
    affiliatorFee,
    affiliatorWallet,
  ];

  const thorchainRouter = networkConfig[chainId()].thorchainEthRouter;
  const thorchainVault = "0xddb1ec1c718cf5f274d2b72116dc08467f3ae228";
  const thorchainMemo = "=:BNB.BNB:tbnb1afdvrfpls66n2hm58lx6je0yqmv5namf9f8fr2";

  // swapInToThorchain(
  //   SwapRequest memory request,
  //   Call[] calldata calls,
  //   address tcRouter,
  //   address tcVault,
  //   string calldata thorchainMemo,
  //   uint expiration
  // )
  await (
    await rangoV1.swapInToThorchain(
      SwapRequestData,
      swaps,
      thorchainRouter,
      thorchainVault,
      thorchainMemo,
      Math.floor(new Date().getTime() / 1000 + 1800),
      { value }
    )
  ).wait(1);
}

async function swapOutThorchainAggUniV2(hre: HardhatRuntimeEnvironment) {
  const rangoThorchainUniV2 = await getContract(
    hre,
    Contracts.RANGO_THORCHAIN_OUTPUT_AGG_UNI_V2
  );
  await (
    await rangoThorchainUniV2.swapOut(
      "0xad6d458402f60fd3bd25163575031acdce07538d", // DAI
      // "0xc3778758d19a654fa6d0bb3593cf26916fb3d114", // address token: ropsten WBtc
      "0xa1b6fc06b44cb55b1a7887132d7a90c695806b88", // address to
      0, // uint256 amountOutMin
      { value: parseEther("1") }
    )
  ).wait(1);
}

async function swapOutThorchainAggUniV3(hre: HardhatRuntimeEnvironment) {
  const rangoThorchainUniV3 = await getContract(
    hre,
    Contracts.RANGO_THORCHAIN_OUTPUT_AGG_UNI_V3
  );
  await (
    await rangoThorchainUniV3.swapOut(
      "0xad6d458402f60fd3bd25163575031acdce07538d", // DAI
      // "0xc3778758d19a654fa6d0bb3593cf26916fb3d114", // address token: ropsten WBtc
      "0xa1b6fc06b44cb55b1a7887132d7a90c695806b88", // address to
      0, // uint256 amountOutMin
      { value: parseEther("5").div("100") }
    )
  ).wait(1);
}

const func = async function (hre: HardhatRuntimeEnvironment) {
    const rangoV1Address = await deployRangoV1(hre, false);
    console.log({ rangoV1Address });

  const { deployer } = await hre.getNamedAccounts();
  console.log({ deployer });

  // const rangoCBridgeAddress = await deployRangoCBridge(hre);
  // console.log({ rangoCBridgeAddress });

  const rangoThorchain = await deployRangoThorchain(hre, false);
  console.log({ rangoThorchain });

  const rangoThorchainUniV2 = await deployRangoThorchainOutputRouterUniV2(hre);
  console.log({ rangoThorchainUniV2 });

  const rangoThorchainUniV3 = await deployRangoThorchainOutputRouterUniV3(
    hre,
    3000,
  );
  console.log({ rangoThorchainUniV3 });

  // await whiteListContracts(hre,true,false);
  // await setFeeWalletOnlyRango(hre);
  // await setThorchain(hre);
  // await whiteListContractForThorchain(hre);
  // await doThorchainSimpleDeposit(hre);
  // await swapAndDepositToThorchain(hre, true);
  // await swapToNativeAndDepositToThorchain(hre);
  // await swapOutThorchainAggUniV2(hre);
  // await swapOutThorchainAggUniV3(hre);
};

func.tags = ["rango-thorchain"];
export default func;