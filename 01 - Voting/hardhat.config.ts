import '@nomicfoundation/hardhat-toolbox';
import '@nomiclabs/hardhat-etherscan';
import 'dotenv/config';
import 'hardhat-gas-reporter';
import { HardhatUserConfig } from 'hardhat/config';

const RINKEBY_ENDPOINT = `https://rinkeby.infura.io/v3/${process.env.INFURA_TOKEN}`;
const POLYGON_ENDPOINT = `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_TOKEN}`;
const MUMBAY_ENDPOINT = `https://polygon-mumbai.infura.io/v3/${process.env.INFURA_TOKEN}`;

const PRIVATE_KEY = process.env.PRIVATE_KEY || '0x...';

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.17',
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: { chainId: 1337 },
    rinkeby: {
      url: RINKEBY_ENDPOINT,
      accounts: [PRIVATE_KEY],
    },
    polygon: {
      url: POLYGON_ENDPOINT,
      accounts: [PRIVATE_KEY],
    },
    mumbay: {
      url: MUMBAY_ENDPOINT,
      accounts: [PRIVATE_KEY],
      gas: 2100000,
      gasPrice: 8000000000,
    },
  },
  gasReporter: {
    enabled: true,
    currency: 'USD',
  },
};

export default config;
