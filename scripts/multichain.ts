import axios from "axios";

type DestChain = { routerToken: string; type: string };
type TokenInfoUnderlying = {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
};
type TokenInfo = {
  address: string;
  destChains: { [chainId: number]: DestChain };
  underlying: false | TokenInfoUnderlying;
};

export async function getAllMultichainRouters(
  chainId: number
): Promise<string[]> {
  const nativeUrl = `https://bridgeapi.anyswap.exchange/v3/serverinfoV4?chainId=${chainId}&version=NATIVE`;
  const allUrl = `https://bridgeapi.anyswap.exchange/v3/serverinfoV4?chainId=${chainId}&version=all`;
  const { data: nativeData } = await axios.get<{
    [contract: string]: TokenInfo;
  }>(nativeUrl);
  const { data: allData } = await axios.get<{
    [type: string]: { [contract: string]: TokenInfo };
  }>(allUrl);

  const l1 = Object.keys(nativeData)
    .map((k) => nativeData[k])
    .flatMap((x) =>
      Object.keys(x.destChains).map((k2) => x.destChains[k2 as any].routerToken)
    );

  const l2 = Object.keys(allData)
    .flatMap((k) => Object.keys(allData[k]).map((k2) => allData[k][k2]))
    .flatMap((x) =>
      Object.keys(x.destChains).map((k2) => x.destChains[k2 as any].routerToken)
    );

  return Array.from(new Set([...l1, ...l2]));
}

export async function getTokenInfo(
  chainId: number,
  erc20Address: string
): Promise<TokenInfo | null> {
  const allUrl = `https://bridgeapi.anyswap.exchange/v3/serverinfoV4?chainId=${chainId}&version=all`;
  const { data: allData } = await axios.get<{
    [type: string]: { [contract: string]: TokenInfo };
  }>(allUrl);
  return (
    Object.keys(allData)
      .flatMap((k) => Object.keys(allData[k]).map((k2) => allData[k][k2]))
      .find((x) => x.address === erc20Address) || null
  );
}
