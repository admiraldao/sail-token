const { ethers } = require('hardhat');

module.exports = async ({ getNamedAccounts }) => {
  const { l2StandardBridgeAcc, l1TokenAcc } = await getNamedAccounts();

  console.log('-------------------------');
  console.log('>> l2StandardBridgeAcc: ', l2StandardBridgeAcc);
  console.log('>> l1TokenAcc: ', l1TokenAcc);
  console.log('');
  console.log('-------------------------');

  const contractName = 'OptimismSailToken';
  const contract = await ethers.deployContract(contractName, [l2StandardBridgeAcc, l1TokenAcc]);
  await contract.waitForDeployment();
  console.log('>> ' + contractName + ' contract: ', await contract.getAddress());
  console.log('-------------------------');
};

module.exports.tags = ['op_token'];
