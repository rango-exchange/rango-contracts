import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// Constants
const { PRIVATE_KEY, ROPSTEN_PRIVATE_KEY } = process.env;
const DEPLOYER = process.env.DEPLOYER_ADDRESS || null;
const ROPSTEN_DEPLOYER = process.env.ROPSTEN_DEPLOYER_ADDRESS || null;
const {
  ETH_MAINNET_RPC_URL,
  FTM_MAINNET_RPC_URL,
  BSC_MAINNET_RPC_URL,
  ROPSTEN_RPC_URL,
  AVAX_MAINNET_RPC_URL,
  POLYGON_MAINNET_RPC_URL,
  ARBITRUM_MAINNET_RPC_URL,
  OPTIMISM_MAINNET_RPC_URL,
  MOONRIVER_MAINNET_RPC_URL,
  AURORA_MAINNET_RPC_URL,
} = process.env;
const accounts = PRIVATE_KEY ? [PRIVATE_KEY] : [];
const ropstenAccounts = ROPSTEN_PRIVATE_KEY ? [ROPSTEN_PRIVATE_KEY] : [];

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.13",
    settings: {
      optimizer: {
        enabled: true,
        runs: 999999,
      },
    },
  },
  defaultNetwork: "bsc",
  networks: {
    eth: {
      url: ETH_MAINNET_RPC_URL,
      saveDeployments: true,
      chainId: 1,
      accounts,
    },
    ftm: {
      url: FTM_MAINNET_RPC_URL,
      saveDeployments: true,
      chainId: 250,
      accounts,
      gasMultiplier: 3,
    },
    bsc: {
      url: BSC_MAINNET_RPC_URL,
      saveDeployments: true,
      chainId: 56,
      accounts,
      gasMultiplier: 3,
    },
    avax: {
      url: AVAX_MAINNET_RPC_URL,
      saveDeployments: true,
      chainId: 43114,
      accounts,
      gasMultiplier: 3,
    },
    polygon: {
      url: POLYGON_MAINNET_RPC_URL,
      saveDeployments: true,
      chainId: 137,
      accounts,
      gasMultiplier: 3,
    },
    arbitrum: {
      url: ARBITRUM_MAINNET_RPC_URL,
      saveDeployments: true,
      chainId: 42161,
      accounts,
      gasMultiplier: 3,
    },
    optimism: {
      url: OPTIMISM_MAINNET_RPC_URL,
      saveDeployments: true,
      chainId: 10,
      accounts,
      gasMultiplier: 3,
    },
    moonriver: {
      url: MOONRIVER_MAINNET_RPC_URL,
      saveDeployments: true,
      chainId: 1285,
      accounts,
      gasMultiplier: 3,
    },
    aurora: {
      url: AURORA_MAINNET_RPC_URL,
      saveDeployments: true,
      chainId: 1313161554,
      accounts,
      gasMultiplier: 3,
    },
    ropsten: {
      url: ROPSTEN_RPC_URL,
      saveDeployments: true,
      chainId: 3,
      accounts: ropstenAccounts,
      gasMultiplier: 5,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  namedAccounts: {
    deployer: {
      default: DEPLOYER,
      ropsten: ROPSTEN_DEPLOYER,
    },
  },
};

export default config;
