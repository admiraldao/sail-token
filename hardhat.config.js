require("@nomicfoundation/hardhat-toolbox");
require('hardhat-deploy');
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  namedAccounts: {
    daoAcc: {
      'localhost': '0x0000000000000000000000000000000000000000',
      'mainnet': 'eth:0xD8Cc0304de58fCE5147796606Db14500d94b5EF2',
      'sepolia': '0x0000000000000000000000000000000000000000',
    },
  },
  networks: {
    localhost: {
      live: false,
      saveDeployments: true,
    },
    mainnet: {
      url: process.env.RPC_URL + process.env.RPC_API_KEY,
      accounts: [process.env.MNEMONIC],
    },
    sepolia: {
      url: process.env.RPC_URL + process.env.RPC_API_KEY,
      chainId: 11155111,
      accounts: [process.env.MNEMONIC],
    },
  }
};
