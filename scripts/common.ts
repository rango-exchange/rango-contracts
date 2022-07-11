import { BigNumber } from "ethers";
import { ethers, network } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { networkConfig } from "../network.config";
import { erc20ABI } from "./abi/erc20.abi";

export const NATIVE_ADDRESS = "0x0000000000000000000000000000000000000000";

export enum Contracts {
  RANGO_V1 = "RangoV1",
  RANGO_CBRIDGE = "RangoCBridge",
  RANGO_MULTICHAIN = "RangoMultichain",
  RANGO_THORCHAIN = "RangoThorchain",
  RANGO_THORCHAIN_OUTPUT_AGG_UNI_V2 = "RangoThorchainOutputAggUniV2",
  RANGO_THORCHAIN_OUTPUT_AGG_UNI_V3 = "RangoThorchainOutputAggUniV3",
}

export async function getContract(
  hre: HardhatRuntimeEnvironment,
  name: string
) {
  const { deployments } = hre;
  const Contract = await ethers.getContractFactory(name);
  return Contract.attach((await deployments.getOrNull(name))?.address || "");
}

export const chainId = () => {
  const c = network.config.chainId || 0;
  if (!c || c === 0) throw Error("Bad chain id");
  return c;
};

export async function printContracts(hre: HardhatRuntimeEnvironment) {
  const rangoV1 = await getContract(hre, Contracts.RANGO_V1);
  const cbridge = await getContract(hre, Contracts.RANGO_CBRIDGE);
  const multichain = await getContract(hre, Contracts.RANGO_MULTICHAIN);
  const thorchain = await getContract(hre, Contracts.RANGO_THORCHAIN);

  console.log(
    JSON.stringify(
      {
        chain: chainId(),
        rangoV1: rangoV1.address,
        cbridge: cbridge.address,
        multichain: multichain.address,
        thorchain: thorchain.address,
      },
      null,
      2
    )
  );
}

export const CBRIDGE_MESSAGE_BUS_ABI = [
  "uint64",
  "bool",
  "address",
  "address",
  "address",
  "uint",
  "address[]",
  "uint",
  "bool",
  "address",
  "address",
  "bytes",
  "address",
  "address"
];

export const SWAP_UNI_NON_NATIVE_ABI = [
  "uint256",
  "uint256",
  "address[]",
  "address",
  "uint256",
];

export const SWAP_UNI_NATIVE_ABI = [
  "uint256",
  "address[]",
  "address",
  "uint256",
];

// SwapRequest {
//   address fromToken;
//   address toToken;
//   uint amountIn;
//   uint feeIn;
//   uint affiliateIn;
//   address payable affiliatorAddress;
// }
export const THORCHAIN_SWAP = [
  "address",
  "address",
  "uint256",
  "uint256",
  "uint256",
  "address",
];

export async function getSwapRequest(
  hre: HardhatRuntimeEnvironment,
  amountKey: string
) {
  const rangoV1 = await getContract(hre, Contracts.RANGO_V1);
  const {
    token1Address,
    token2Address,
    uniswapMiddleToken,
    affiliatorWallet,
    uniswapDexSample,
    rangoFee,
    affiliatorFee,
  } = networkConfig[chainId()];
  const amountOutMin = "0";
  const token1SwapAmount = networkConfig[chainId()][amountKey];
  const swapPath = uniswapMiddleToken
    ? [token1Address, uniswapMiddleToken, token2Address]
    : [token1Address, token2Address];

  console.log({ swapPath });

  if (token1Address !== NATIVE_ADDRESS) {
    const token1ABI = erc20ABI;
    const token1Contract = await ethers.getContractAt(token1ABI, token1Address);
    const approvedAmount = await token1Contract.allowance(
      affiliatorWallet,
      rangoV1.address
    );
    const expectedApproveAmount = BigNumber.from(10_000).mul(
      BigNumber.from(token1SwapAmount)
    );

    console.log(
      `approved amount: ${approvedAmount}, expected: ${expectedApproveAmount}`
    );

    if (BigNumber.from(approvedAmount).lt(expectedApproveAmount)) {
      const tx = await token1Contract.approve(
        rangoV1.address,
        expectedApproveAmount
      );
      await tx.wait(1);
    }
  }

  return {
    affiliatorFee,
    affiliatorWallet,
    amountOutMin,
    rangoFee,
    swapPath,
    token1Address,
    token1SwapAmount,
    token2Address,
    uniswapDexSample,
  };
}

export function getSwaps(
  rangoV1Address: string,
  amountOutMin: string,
  swapPath: string[],
  token1SwapAmount: string,
  uniswapDexSample: string,
  isInputNative: boolean = false,
  isOutputNative: boolean = false
) {
  let swapHex = "";
  if (!isInputNative && !isOutputNative) {
    swapHex = ethers.utils.hexConcat([
      "0x38ed1739",
      ethers.utils.defaultAbiCoder.encode(SWAP_UNI_NON_NATIVE_ABI, [
        token1SwapAmount,
        amountOutMin,
        swapPath,
        rangoV1Address,
        Math.floor(new Date().getTime() / 1000 + 1800),
      ]),
    ]);
  } else if (isInputNative && !isOutputNative) {
    swapHex = ethers.utils.hexConcat([
      "0x7ff36ab5",
      ethers.utils.defaultAbiCoder.encode(SWAP_UNI_NATIVE_ABI, [
        amountOutMin,
        swapPath,
        rangoV1Address,
        Math.floor(new Date().getTime() / 1000 + 1800),
      ]),
    ]);
  } else if (!isInputNative && isOutputNative) {
    swapHex = ethers.utils.hexConcat([
      "0x18cbafe5",
      ethers.utils.defaultAbiCoder.encode(SWAP_UNI_NON_NATIVE_ABI, [
        token1SwapAmount,
        amountOutMin,
        swapPath,
        rangoV1Address,
        Math.floor(new Date().getTime() / 1000 + 1800),
      ]),
    ]);
  } else {
    throw new Error("Cannot have both input and output as native");
  }
  return [[uniswapDexSample, ethers.utils.arrayify(swapHex)]];
}
