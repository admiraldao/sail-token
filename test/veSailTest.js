const { expect } = require('chai');


describe('veSAIL', function() {

 let vaultContract;
 let veSAIL;
 let sail;
 let dao;
 const tokenDecimals = 18;
 const tokenDecimalExp = BigInt('10')**BigInt(tokenDecimals);


 beforeEach(async function() {
  // deploy libraries neccesary for the smart contract
  const [owner, dao] = await ethers.getSigners();
  signers = await ethers.getSigners();


  const SailToken = await ethers.getContractFactory("SailToken");
  sail = await SailToken.deploy(dao);

  await sail.connect(dao).transfer(signers[2], BigInt("100000")*BigInt(tokenDecimalExp));

  const veSAILFactory = await ethers.getContractFactory("veSAIL");
  veSAIL = await veSAILFactory.deploy(sail.target);

  await Promise.all(
        [signers[0], signers[1], signers[2], signers[3]].map(async (addr) => {
          await sail.connect(addr).approve(veSAIL.target, BigInt("10000000000000")*BigInt(tokenDecimalExp));
        })
    );

 });

 it("Deposit Test", async () => {
  		await veSAIL.connect(signers[2]).deposit(BigInt('20000')*BigInt(tokenDecimalExp));
  		const user1Bal = await veSAIL.connect(signers[2]).balanceOf(signers[2].address);
  		expect(user1Bal).to.be.equal(BigInt('20000')*BigInt(tokenDecimalExp));
  	});
 it("Withdrawal Test", async () => {
        await veSAIL.connect(signers[2]).deposit(BigInt('20000')*BigInt(tokenDecimalExp));
        await veSAIL.connect(signers[2]).withdraw(BigInt('20000')*BigInt(tokenDecimalExp));
        const user1Bal = await sail.connect(signers[2]).balanceOf(signers[2].address);
        expect(user1Bal).to.be.equal(BigInt('100000')*BigInt(tokenDecimalExp));
    });
 it("Yield Tests", async () => {
        await veSAIL.connect(signers[2]).deposit(BigInt('20000')*BigInt(tokenDecimalExp));
        await sail.connect(signers[1]).transfer(veSAIL.target, BigInt('5000')*BigInt(tokenDecimalExp));
        const exchangeRate = await veSAIL.connect(signers[2]).getExchangeRate();
        expect(exchangeRate).to.be.equal(BigInt('125')*BigInt('10000000'));
        const sailFromVeSAIL = await veSAIL.connect(signers[2]).toSAIL(BigInt(1)*BigInt(tokenDecimalExp));
        expect(sailFromVeSAIL).to.be.equal(BigInt('125')*BigInt('10')**BigInt(tokenDecimals-2));
        await veSAIL.connect(signers[2]).withdraw(BigInt('20000')*BigInt(tokenDecimalExp));
        const user1Bal = await sail.connect(signers[2]).balanceOf(signers[2].address);
        expect(user1Bal).to.be.equal(BigInt('105000')*BigInt(tokenDecimalExp));
    });

});
