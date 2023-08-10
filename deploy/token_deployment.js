const { ethers } = require('hardhat');

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { daoAcc } = await getNamedAccounts();
  const [deploymentOwner] = await ethers.getSigners();

  console.log('-------------------------');
  console.log('>> deploymentOwner: ', deploymentOwner.address);
  console.log('>> daoAcc: ', daoAcc);
  console.log('');
  console.log('-------------------------');

  const contractName = 'SailToken';
  const contract = await ethers.deployContract(contractName, [daoAcc]);
  await contract.waitForDeployment();
  console.log('>> ' + contractName + ' contract: ', await contract.getAddress());
  console.log('-------------------------');
};

module.exports.tags = ['token'];
