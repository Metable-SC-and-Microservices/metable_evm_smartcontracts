const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
function FromSum18(Sum) {
    return hre.ethers.utils.parseUnits(String(Sum), 18);
}

describe("MetableVesting methods", async function () {

    before(async function () {
        [this.owner1, this.owner2] = await ethers.getSigners();
        this.vestingFactory = await ethers.getContractFactory("contracts/MetableVesting.sol:MetableVesting");
        this.governanceTokenFactory = await ethers.getContractFactory("contracts/GovernanceToken.sol:GovernanceToken");
        this.usdFactory = await ethers.getContractFactory("contracts/usdtest.sol:USDTest");
        this.gameToken = await ethers.getContractFactory("contracts/GameToken.sol:GameToken"); //  for buy things

        // this.governance = await this.governanceTokenFactory.deploy(FromSum18(1e6));
    });

    it('should setCoin()', async function () {
        let vesting = await this.vestingFactory.deploy();
        let TokenUSD = await this.usdFactory.deploy();
        await TokenUSD.Mint(FromSum18(1000));
        await expect(vesting.setCoin(TokenUSD.address, FromSum18(1))).to.not.be.reverted;
    });

    it('should setSale()', async function () {
        let governance = await this.governanceTokenFactory.deploy(FromSum18(1e6));
        await governance.Mint(5000);
        let TokenUSD = await this.usdFactory.deploy();
        await TokenUSD.Mint(FromSum18(1000));
        let Price = FromSum18(2);
        //1000 + current block timestamo, because require(block.timestamp <= saleStart)
        let SaleStart = 1000 + (await time.latest());
        let timeCliff = SaleStart + 2000;
        let vesting = await this.vestingFactory.deploy();
        await vesting.setCoin(TokenUSD.address, FromSum18(1));
        await vesting.setSale(governance.address, FromSum18(5000), Price, SaleStart, SaleStart + 1000, timeCliff, 7, 100, 10000);
        expect((await vesting.getSale(governance.address, SaleStart)).length).to.be.greaterThan(0);
    });
    it('should not be possibile to setSale() if price = 0', async function () {
        let governance = await this.governanceTokenFactory.deploy(FromSum18(1e6));
        await governance.Mint(5000);
        let TokenUSD = await this.usdFactory.deploy();
        await TokenUSD.Mint(FromSum18(1000));
        let Price = FromSum18(2);
        //1000 + current block timestamo, because require(block.timestamp <= saleStart)
        let SaleStart = 1000 + (await time.latest());
        let timeCliff = SaleStart + 2000;
        let vesting = await this.vestingFactory.deploy();
        await vesting.setCoin(TokenUSD.address, FromSum18(1));
        await expect(vesting.setSale(governance.address, FromSum18(5000),
            0,
            SaleStart, SaleStart + 1000,
            timeCliff, 7, 100, 10000)).to.be.rejectedWith("Error, zero price");
    });
    it('should not be possibile to setSale() if  vestingPeriodCounts < 2', async function () {
        let governance = await this.governanceTokenFactory.deploy(FromSum18(1e6));
        await governance.Mint(5000);
        let TokenUSD = await this.usdFactory.deploy();
        await TokenUSD.Mint(FromSum18(1000));
        let Price = FromSum18(2);
        //1000 + current block timestamo, because require(block.timestamp <= saleStart)
        let SaleStart = 1000 + (await time.latest());
        let timeCliff = SaleStart + 2000;
        let vesting = await this.vestingFactory.deploy();
        await vesting.setCoin(TokenUSD.address, FromSum18(1));
        await expect(vesting.setSale(governance.address, FromSum18(5000),
            Price,
            SaleStart, SaleStart + 1000,
            timeCliff, 1,
            100, 10000))
            .to
            .be
            .rejectedWith("The minimum value of the vesting Period counts should be 2");
    });
    it('should not be possibile to setSale() if block.timestamp <= timeStart', async function () {
        let governance = await this.governanceTokenFactory.deploy(FromSum18(1e6));
        await governance.Mint(5000);
        let TokenUSD = await this.usdFactory.deploy();
        await TokenUSD.Mint(FromSum18(1000));
        let Price = FromSum18(2);
        let SaleStart = (await time.latest()) - 10;
        let timeCliff = SaleStart + 2000;
        let vesting = await this.vestingFactory.deploy();
        await vesting.setCoin(TokenUSD.address, FromSum18(1));
        await expect(vesting.setSale(governance.address, FromSum18(5000),
            Price,
            SaleStart, SaleStart + 1000,
            timeCliff, 7,
            100, 10000))
            .to
            .be
            .rejectedWith("Error timeStart");
    });
    it('should not be possibile to setSale() if timeStart<=timeExpires', async function () {
        let governance = await this.governanceTokenFactory.deploy(FromSum18(1e6));
        await governance.Mint(5000);
        let TokenUSD = await this.usdFactory.deploy();
        await TokenUSD.Mint(FromSum18(1000));
        let Price = FromSum18(2);
        let SaleStart = 1000 + (await time.latest()) ;
        let timeCliff = SaleStart + 2000;
        let vesting = await this.vestingFactory.deploy();
        await vesting.setCoin(TokenUSD.address, FromSum18(1));
        await expect(vesting.setSale(governance.address, FromSum18(5000),
            Price,
            SaleStart, SaleStart - 1000,
            timeCliff, 7,
            100, 10000))
            .to
            .be
            .rejectedWith("Error timeExpires");
    });
    it('should not be possibile to setSale() if timeExpires<=timeCliff', async function () {
        let governance = await this.governanceTokenFactory.deploy(FromSum18(1e6));
        await governance.Mint(5000);
        let TokenUSD = await this.usdFactory.deploy();
        await TokenUSD.Mint(FromSum18(1000));
        let Price = FromSum18(2);
        let SaleStart = 1000 + (await time.latest()) ;
        let timeCliff = SaleStart + 999;
        let vesting = await this.vestingFactory.deploy();
        await vesting.setCoin(TokenUSD.address, FromSum18(1));
        await expect(vesting.setSale(governance.address, FromSum18(5000),
            Price,
            SaleStart,SaleStart + 1000,
            timeCliff, 7,
            100, 10000))
            .to
            .be
            .rejectedWith("Error timeCliff");
    });

    it('should buyToken()', async function () {

        let governance = await this.governanceTokenFactory.deploy(FromSum18(1e6));
        await governance.Mint(5000);

        let TokenUSD = await this.usdFactory.deploy();
        await TokenUSD.Mint(FromSum18(1000));

        let Price = FromSum18(2);

        //1000 + current block timestamo, because require(block.timestamp <= saleStart)
        let SaleStart = 1000 + (await time.latest());

        let timeCliff = SaleStart + 2000;

        let vesting = await this.vestingFactory.deploy();
        await vesting.setCoin(TokenUSD.address, FromSum18(1));
        await vesting.setSale(governance.address, FromSum18(5000), Price, SaleStart, SaleStart + 1000, timeCliff, 7, 100, 10000);
        expect((await vesting.getSale(governance.address, SaleStart)).length).to.be.greaterThan(0);
        await time.increaseTo(SaleStart + 2);
        await TokenUSD.approve(vesting.address, FromSum18(1000));
        await vesting.buyToken(governance.address, SaleStart, TokenUSD.address, FromSum18(100));

        console.log("USD: ", (await TokenUSD.balanceOf(this.owner1.address)));
        const balance = await TokenUSD.balanceOf(this.owner1.address)
        expect(balance).to.be.equal(FromSum18(800));
    });
    /*
    setSale
    withdraw
    withdrawCoins
    withdrawEth
    balanceOf
    getSale
    */


})
