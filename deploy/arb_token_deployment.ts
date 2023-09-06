import { BigNumber, ContractFactory, Wallet } from "ethers";
import { ethers } from "hardhat";
import { Erc20Bridger } from "arb-ts";

async function main() {

const { l1TokenAcc } = await getNamedAccounts();
const l2Network = await getL2Network(l2Provider);
const erc20Bridge = new Erc20Bridger(l2Network);

/**
 * The Standard Gateway contract will ultimately be making the token transfer call; thus, that's the contract we need to approve.
 * erc20Bridger.approveToken handles this approval
 * Arguments required are:
 * (1) l1Signer: The L1 address transferring token to L2
 * (2) erc20L1Address: L1 address of the ERC20 token to be depositted to L2
 */
console.log('Approving:');
const approveTx = await erc20Bridger.approveToken({
  l1Signer: **********,
  erc20L1Address: l1tokenAcc,
});

const approveRec = await approveTx.wait();
console.log(
  `You successfully allowed the Arbitrum Bridge to spend ${approveRec.transactionHash}`,
);

/**
 * Deposit DappToken to L2 using erc20Bridger. This will escrow funds in the Gateway contract on L1, and send a message to mint tokens on L2.
 * The erc20Bridge.deposit method handles computing the necessary fees for automatic-execution of retryable tickets — maxSubmission cost & l2 gas price * gas — and will automatically forward the fees to L2 as callvalue
 * Also note that since this is the first DappToken deposit onto L2, a standard Arb ERC20 contract will automatically be deployed.
 * Arguments required are:
 * (1) amount: The amount of tokens to be transferred to L2
 * (2) erc20L1Address: L1 address of the ERC20 token to be depositted to L2
 * (2) l1Signer: The L1 address transferring token to L2
 * (3) l2Provider: An l2 provider
 */
const depositTx = await erc20Bridger.deposit({
  amount: tokenDepositAmount,
  erc20L1Address: l1TokenAcc,
  l1Signer: *********,
  l2Provider: l2Provider,
});

/**
 * Now we wait for L1 and L2 side of transactions to be confirmed
 */
const depositRec = await depositTx.wait();
const l2Result = await depositRec.waitForL2(l2Provider);

/**
 * The `complete` boolean tells us if the l1 to l2 message was successful
 */
l2Result.complete
  ? console.log(`L2 message successful: status: ${L1ToL2MessageStatus[l2Result.status]}`)
  : console.log(`L2 message failed: status ${L1ToL2MessageStatus[l2Result.status]}`);

/**
 * Check if our l2Wallet DappToken balance has been updated correctly
 * To do so, we use erc20Bridge to get the l2Token address and contract
 */
const l2TokenAddress = await erc20Bridger.getL2ERC20Address(l1TokenAcc, l1Provider);
const l2Token = erc20Bridger.getL2TokenContract(l2Provider, l2TokenAddress);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });