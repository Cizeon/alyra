require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');

module.exports = {
  contracts_build_directory: '../client/src/contracts',
  networks: {
    development: {
      // host: '127.0.0.1', // Localhost (default: none)
      // port: 8545, // Standard Ethereum port (default: none)
      // network_id: '*', // Any network (default: none)
      // provider: () => new Web3.providers.HttpProvider('http://127.0.0.1:8545'),
      network_id: '*',
      provider: function () {
        return new HDWalletProvider(`${process.env.PRIVATE_KEY}`, 'http://localhost:8545');
      },
    },

    goerli: {
      provider: () => {
        return new HDWalletProvider(
          process.env.PRIVATE_KEY,
          'https://goerli.infura.io/v3/' + process.env.INFURA_API_KEY,
        );
      },
      network_id: '5',
    },
  },

  mocha: {
    reporter: 'eth-gas-reporter',
    reporterOptions: {
      gasPrice: 1,
      token: 'ETH',
      showTimeSpent: 1,
      excludeContracts: ['Migrations'],
    },
  },

  compilers: {
    solc: {
      version: '0.8.17',
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  },
};
