const { ethers } = require('hardhat');

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { tokenAcc } = await getNamedAccounts();
  const [deploymentOwner] = await ethers.getSigners();

  console.log('-------------------------');
  console.log('>> deploymentOwner: ', deploymentOwner.address);
  console.log('>> tokenAcc: ', tokenAcc);
  console.log('');
  console.log('-------------------------');

  const contractName = 'VeSail';
  const contract = await ethers.deployContract(contractName, [tokenAcc]);
  await contract.waitForDeployment();
  console.log('>> ' + contractName + ' contract: ', await contract.getAddress());
  console.log('-------------------------');
};

module.exports.tags = ['mainnet_vested_token'];
