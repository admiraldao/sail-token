require('@nomicfoundation/hardhat-toolbox');
require('hardhat-deploy');
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.18',
  namedAccounts: {
    daoAcc: {
      localhost: '0x0000000000000000000000000000000000000000',
      mainnet: '0xD8Cc0304de58fCE5147796606Db14500d94b5EF2',
      goerli: '0x3D5a771e690Af1Bbd854Df638eD945baf1066ED0',
    },
    l2StandardBridgeAcc: {
      op_mainnet: '0x4200000000000000000000000000000000000010',
      op_goerli: '0x4200000000000000000000000000000000000010',
    },
    l1TokenAcc: {
      arbitrum: '0xd8F1460044925d2D5c723C7054cd9247027415B7',
      op_mainnet: '0xd8F1460044925d2D5c723C7054cd9247027415B7',
      op_goerli: '0x769728b5298445BA2828c0f3F5384227fbF590C5',
    },
  },
  networks: {
    localhost: {
      live: false,
      saveDeployments: true,
    },
    mainnet: {
      url: 'https://eth-mainnet.g.alchemy.com/v2/' + process.env.MAINNET_ALCHEMY_KEY,
      accounts: [process.env.MNEMONIC],
      chainId: 1,
    },
    goerli: {
      url:
        'https://eth-goerli.g.alchemy.com/v2/' + process.env.GOERLI_ALCHEMY_KEY,
      chainId: 5,
      accounts: [process.env.MNEMONIC],
    },
    op_mainnet: {
      url:
        'https://opt-mainnet.g.alchemy.com/v2/' +
        process.env.OP_MAINNET_ALCHEMY_KEY,
      chainId: 10,
      accounts: [process.env.MNEMONIC],
    },
    op_goerli: {
      url:
        'https://opt-goerli.g.alchemy.com/v2/' +
        process.env.OP_GOERLI_ALCHEMY_KEY,
      chainId: 420,
      accounts: [process.env.MNEMONIC],
    },
    arbitrum: {
      url:
        'https://arb-mainnet.g.alchemy.com/v2/' +
        process.env.ARBITRUM_ALCHEMY_KEY,
      chainId: 42161,
      accounts: [process.env.MNEMONIC],
    },
  },
};
