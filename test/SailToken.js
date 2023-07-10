const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
require("@nomicfoundation/hardhat-chai-matchers");
const { expect } = require("chai");

describe("Sail Token Tests", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deploySailTokenFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, dao] = await ethers.getSigners();

    const SailToken = await ethers.getContractFactory("SailToken");
    const sail = await SailToken.deploy(dao);

    return { sail, dao };
  }

  describe("Deployment", function () {

    it("Should set the right owner", async function () {
      const { sail, dao } = await loadFixture(deploySailTokenFixture);

      expect(await sail.owner()).to.equal(dao.address);
    });

    it("DAO balance should be set properly", async function () {
      const { sail, dao } = await loadFixture(deploySailTokenFixture);

      expect(await sail.balanceOf(dao.address)).to.equal(1_000_000_000);
      expect(await sail.totalSupply()).to.equal(1_000_000_000);
    });

  });

  describe("Minting", function () {
    
    var currentTimestamp;
    const fifteenDays = 60*60*24*15;

    before(async function () {
      currentTimestamp = await time.latest();
    });

    describe("Setting Mint", function () {
      it("Should revert if setting mint from not owner", async function () {
        const { sail } = await loadFixture(deploySailTokenFixture);

        await expect(sail.setMint(100, currentTimestamp)).to.be.revertedWith(
          "Ownable: caller is not the owner"
        );
      });

      it("Should revert if minting too much", async function () {
        const { sail, dao } = await loadFixture(deploySailTokenFixture);

        await expect(sail.connect(dao).setMint(currentTimestamp+fifteenDays, 100_000_000)).to.be.revertedWithCustomError(
          sail,
          "InvalidMint"
        );
      });
      
      it("Should revert if minting too soon", async function () {
        const { sail, dao } = await loadFixture(deploySailTokenFixture);

        await expect(sail.connect(dao).setMint(currentTimestamp, 100)).to.be.revertedWithCustomError(
          sail,
          "InvalidMint"
        );
      });

      it("Works correctly if valid", async function () {
        const { sail, dao } = await loadFixture(deploySailTokenFixture);


        await sail.connect(dao).setMint(currentTimestamp+fifteenDays, 25_000_000);

        expect(await sail.nextMintTime()).to.equal(currentTimestamp+fifteenDays);
        expect(await sail.nextMintAmount()).to.equal(25_000_000);
      });

    });

    describe("Execute Mint", function () {

      it("Correctly executes a mint", async function () {
        const { sail, dao } = await loadFixture(deploySailTokenFixture);


        await sail.connect(dao).setMint(currentTimestamp+fifteenDays, 25_000_000);

        await expect(sail.executeMint()).to.be.revertedWithCustomError(
          sail,
          "InvalidMint"
        );

        await time.increaseTo(currentTimestamp+fifteenDays);

        await sail.executeMint();

        expect(await sail.nextMintTime()).to.equal(0);
        expect(await sail.balanceOf(dao.address)).to.equal(1_025_000_000);

        await expect(sail.executeMint()).to.be.revertedWithCustomError(
          sail,
          "InvalidMint"
        );
      });

    });

  });
});
