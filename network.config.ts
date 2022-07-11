import * as dotenv from "dotenv";

dotenv.config();

const {
  FEE_WALLET_ADDRESS
} = process.env;

export const networkConfig: any = {
  1: {
    validContracts: [
      "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", // uniswap router v2
      "0xE592427A0AEce92De3Edee1F18E0157C05861564", // uniswap swaprouter v3
      "0x1111111254fb6c44bAC0beD2854e76F90643097d", // 1inch
      "0x1116898DdA4015eD8dDefb84b6e8Bc24528Af2d8", // synapse swapper
    ],
    wrappedToken: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    feeWallet: FEE_WALLET_ADDRESS,
    affiliatorWallet: FEE_WALLET_ADDRESS,
    cBridgeContract: "0x5427FEFA711Eff984124bFBB1AB6fbf5E3DA1820",
    cBridgeIMMessageBus: "0x4066d196a423b2b3b8b054f4f40efb47a74e200c",
    thorchainEthRouter: "0x3624525075b88B24ecc29CE226b0CEc1fFcB6976",
    uniswapRouterV2: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    uniswapRouterV3: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
  },
  1285: { // moonriver
    validContracts: [
      '0xAA30eF758139ae4a7f798112902Bf6d65612045f', // solarbeam
    ],
    wrappedToken: "0x98878B06940aE243284CA214f92Bb71a2b032B8A",
    feeWallet: FEE_WALLET_ADDRESS,
    affiliatorWallet: FEE_WALLET_ADDRESS,
    cBridgeContract: "0x841ce48F9446C8E281D3F1444cB859b4A6D0738C",
    cBridgeIMMessageBus: "0x940dAAbA3F713abFabD79CdD991466fe698CBe54",
  },
  10: { // optimism
    validContracts: [
        "0x1111111254760f7ab3f16433eea9304126dcd199", // 1inch
    ],
    wrappedToken: "0x4200000000000000000000000000000000000006",
    feeWallet: FEE_WALLET_ADDRESS,
    affiliatorWallet: FEE_WALLET_ADDRESS,
    cBridgeContract: "0x9D39Fc627A6d9d9F8C831c16995b209548cc3401",
    cBridgeIMMessageBus: "0x0D71D18126E03646eb09FEc929e2ae87b7CAE69d",
  },
  42161: { // arbitrum
    validContracts: [
        "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506", // sushi
        "0x1111111254fb6c44bac0bed2854e76f90643097d", // 1inch
        "0x9Dd329F5411466d9e0C488fF72519CA9fEf0cb40", // synapse swapper
    ],
    wrappedToken: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
    feeWallet: FEE_WALLET_ADDRESS,
    affiliatorWallet: FEE_WALLET_ADDRESS,
    cBridgeContract: "0x1619DE6B6B20eD217a58d00f37B9d47C7663feca",
    cBridgeIMMessageBus: "0x3ad9d0648cdaa2426331e894e980d0a5ed16257f",
  },
  137: { // polygon
    validContracts: [
        "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff", // quick swap
        "0x1111111254fb6c44bac0bed2854e76f90643097d", // 1inch
        "0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57", // paraswap
        "0x85fCD7Dd0a1e1A9FCD5FD886ED522dE8221C3EE5", // synapse swapper
    ],
    wrappedToken: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
    feeWallet: FEE_WALLET_ADDRESS,
    affiliatorWallet: FEE_WALLET_ADDRESS,
    cBridgeContract: "0x88DCDC47D2f83a99CF0000FDF667A468bB958a78",
    cBridgeIMMessageBus: "0xaFDb9C40C7144022811F034EE07Ce2E110093fe6",
  },
  43114: { // avax
    validContracts: [
        "0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106", // pangolin
        "0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57", // paraswap
        "0xED2a7edd7413021d440b09D654f3b87712abAB66", // synapse swapper
    ],
    wrappedToken: "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
    feeWallet: FEE_WALLET_ADDRESS,
    affiliatorWallet: FEE_WALLET_ADDRESS,
    cBridgeContract: "0xef3c714c9425a8F3697A9C969Dc1af30ba82e5d4",
    cBridgeIMMessageBus: "0x5a926eeeafc4d217add17e9641e8ce23cd01ad57",
  },
  250: { // fantom
    rangoCBridge: "INVALID",
    validContracts: [
        "0xf491e7b69e4244ad4002bc14e878a34207e38c29", // spooky
        "0x6352a56caadC4F1E25CD6c75970Fa768A3304e64", // open-ocean
    ],
    validMessagingDApps: [
    ],
    wrappedToken: "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
    feeWallet: FEE_WALLET_ADDRESS,
    affiliatorWallet: FEE_WALLET_ADDRESS,
    token1Address: "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
    token2Address: "0x04068da6c83afcfa0e13ba15a6696662335d5b75",
    uniswapDexSample: "0xf491e7b69e4244ad4002bc14e878a34207e38c29",
    uniswapMiddleToken: "0x74b23882a30290451a17c44f4f05243b6b58c76d",
    token1SwapAmount: "10000000000000000",
    token1BridgeAmount: "20000000000000000000",
    rangoFee: "10000000000000",
    affiliatorFee: "20000000000000",
    cBridgeContract: "0x374B8a9f3eC5eB2D97ECA84Ea27aCa45aa1C57EF",
    cBridgeIMMessageBus: "0xFF4E183a0Ceb4Fa98E63BbF8077B929c8E5A2bA4",
    cBridgeDest: {
      chainId: 56,
      dexAddress: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
      fromToken: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
      toToken: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
      recipient: FEE_WALLET_ADDRESS,
      nativeOut: true,
    },
    multichainConfig: {
      destChainId: 56,
    },
  },
  56: { // bsc
    rangoCBridge: "INVALID",
    validContracts: [
      "0x10ED43C718714eb63d5aA57B78B54704E256024E", // pancake
      "0x1111111254fb6c44bac0bed2854e76f90643097d", // 1inch
      "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506", // sushi
      "0x28ec0B36F0819ecB5005cAB836F4ED5a2eCa4D13", // synapse swapper
    ],
    validMessagingDApps: [
    ],
    wrappedToken: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
    feeWallet: FEE_WALLET_ADDRESS,
    affiliatorWallet: FEE_WALLET_ADDRESS,
    token1Address: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
    token2Address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
    uniswapDexSample: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
    token1SwapAmount: "100000000000000",
    token1BridgeAmount: "100000000000000000",
    rangoFee: "1000000000000",
    affiliatorFee: "2000000000000",
    cBridgeContract: "0xdd90E5E87A2081Dcf0391920868eBc2FFB81a1aF",
    cBridgeIMMessageBus: "0x95714818fdd7a5454f73da9c777b3ee6ebaeea6b",
    cBridgeDest: {
      chainId: 250,
      dexAddress: "0xf491e7b69e4244ad4002bc14e878a34207e38c29",
      fromToken: "0x04068da6c83afcfa0e13ba15a6696662335d5b75",
      toToken: "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
      middleToken: "0x74b23882a30290451a17c44f4f05243b6b58c76d",
      recipient: FEE_WALLET_ADDRESS,
      nativeOut: true,
      bridgeNativeOut: false,
    },
    multichainConfig: {
      destChainId: 250,
    },
  },
  3: { // ropsten
    validContracts: ["0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"],
    wrappedToken: "0xc778417e063141139fce010982780140aa0cd5ab",
    feeWallet: FEE_WALLET_ADDRESS,
    affiliatorWallet: FEE_WALLET_ADDRESS,
    token1Address: "0xc778417e063141139fce010982780140aa0cd5ab", // WETH
    token2Address: "0xad6d458402f60fd3bd25163575031acdce07538d", // DAI
    uniswapDexSample: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    token1SwapAmount: "100000000000000000",
    rangoFee: "0",
    affiliatorFee: "0",
    uniswapRouterV2: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    uniswapRouterV3: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    thorchainEthRouter: "0xbba228C54392463Fbde615941DF1328d8CC51696",
  },
};
