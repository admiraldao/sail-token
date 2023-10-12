const { ethers, config: hardhatConfig } = require('hardhat');
const {
  getL2Network,
  Erc20Bridger,
  L1ToL2MessageStatus,
} = require('@arbitrum/sdk');
const { providers } = require('ethers')
const { expect } = require('chai');
const { BigNumber } = require('@ethersproject/bignumber');

module.exports = async ({ getNamedAccounts }) => {
  const { l1TokenAcc } = await getNamedAccounts();
  console.log('-------------------------');
  console.log('>> l1TokenAcc: ', l1TokenAcc);
  console.log('');
  console.log('-------------------------');

  const l1Provider = new providers.JsonRpcProvider(
    hardhatConfig.networks.mainnet.url
  );
  const l2Provider = ethers.provider;

  const l1Wallet = new ethers.Wallet(
    hardhatConfig.networks.mainnet.accounts[0],
    l1Provider
  );
  const [l2Wallet] = await ethers.getSigners();

  const L1SailToken = await (
    await ethers.getContractAt('SailToken', l1TokenAcc)
  ).connect(l1Wallet);

  /**
   * Use l2Network to create an Arbitrum SDK Erc20Bridger instance
   * We'll use Erc20Bridger for its convenience methods around transferring token to L2
   */
  const l2Network = await getL2Network(l2Provider);
  const erc20Bridger = new Erc20Bridger(l2Network);

  /**
   * We get the address of L1 Gateway for our SAIL, which later helps us to get the initial token balance of Bridge (before deposit)
   */
  const l1Erc20Address = L1SailToken.address;
  const expectedL1GatewayAddress = await erc20Bridger.getL1GatewayAddress(
    l1Erc20Address,
    l1Provider
  );
  const initialBridgeTokenBalance = await L1SailToken.balanceOf(
    expectedL1GatewayAddress
  );

  const tokenDecimals = await L1SailToken.decimals()
  const tokenDepositAmount = BigNumber.from(1).mul(
    BigNumber.from(10).pow(tokenDecimals)
  )

  /**
   * The Standard Gateway contract will ultimately be making the token transfer call; thus, that's the contract we need to approve.
   * erc20Bridger.approveToken handles this approval
   * Arguments required are:
   * (1) l1Signer: The L1 address transferring token to L2
   * (2) erc20L1Address: L1 address of the ERC20 token to be depositted to L2
   */
  console.log('Approving:');
  const approveTx = await erc20Bridger.approveToken({
    l1Signer: l1Wallet,
    erc20L1Address: l1Erc20Address,
    amount: tokenDepositAmount,
  });

  const approveRec = await approveTx.wait();
  console.log(
    `You successfully allowed the Arbitrum Bridge to spend SAIL ${approveRec.transactionHash}`
  );

  /**
   * Deposit Sail to L2 using erc20Bridger. This will escrow funds in the Gateway contract on L1, and send a message to mint tokens on L2.
   * The erc20Bridge.deposit method handles computing the necessary fees for automatic-execution of retryable tickets — maxSubmission cost & l2 gas price * gas — and will automatically forward the fees to L2 as callvalue
   * Also note that since this is the first SAIL deposit onto L2, a standard Arb ERC20 contract will automatically be deployed.
   * Arguments required are:
   * (1) amount: The amount of tokens to be transferred to L2
   * (2) erc20L1Address: L1 address of the ERC20 token to be depositted to L2
   * (2) l1Signer: The L1 address transferring token to L2
   * (3) l2Provider: An l2 provider
   */
  console.log('Transferring Sail to L2:');
  const depositTx = await erc20Bridger.deposit({
    amount: tokenDepositAmount,
    erc20L1Address: l1Erc20Address,
    l1Signer: l1Wallet,
    l2Provider: l2Provider,
  });

  /**
   * Now we wait for L1 and L2 side of transactions to be confirmed
   */
  console.log(
    `Deposit initiated: waiting for L2 retryable (takes 10-15 minutes; current time: ${new Date().toTimeString()}) `
  )
  const depositRec = await depositTx.wait()
  const l2Result = await depositRec.waitForL2(l2Provider)

  /**
   * The `complete` boolean tells us if the l1 to l2 message was successful
   */
  l2Result.complete
    ? console.log(
        `L2 message successful: status: ${L1ToL2MessageStatus[l2Result.status]}`
      )
    : console.log(
        `L2 message failed: status ${L1ToL2MessageStatus[l2Result.status]}`
      )

  /**
   * Get the Bridge token balance
   */
  const finalBridgeTokenBalance = await L1SailToken.balanceOf(
    expectedL1GatewayAddress
  )

  /**
   * Check if Bridge balance has been updated correctly
   */
  expect(
    initialBridgeTokenBalance
      .add(tokenDepositAmount)
      .eq(finalBridgeTokenBalance),
    'bridge balance not updated after L1 token deposit txn'
  ).to.be.true

  /**
   * Check if our l2Wallet SAIL balance has been updated correctly
   * To do so, we use erc20Bridge to get the l2Token address and contract
   */
  const l2TokenAddress = await erc20Bridger.getL2ERC20Address(
    l1Erc20Address,
    l1Provider
  )

  console.log('-------------------------');
  console.log('>> L2 Sail contract: ', l2TokenAddress);
  console.log('-------------------------');

  const l2Token = erc20Bridger.getL2TokenContract(l2Provider, l2TokenAddress)

  const testWalletL2Balance = (
    await l2Token.functions.balanceOf(l2Wallet.address)
  )[0]
  expect(
    testWalletL2Balance.eq(tokenDepositAmount),
    'l2 wallet not updated after deposit'
  ).to.be.true
};

module.exports.tags = ['arbitrum_token'];
