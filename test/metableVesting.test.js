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
        let SaleStart = 1000 + (await time.latest());
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
        let SaleStart = 1000 + (await time.latest());
        let timeCliff = SaleStart + 999;
        let vesting = await this.vestingFactory.deploy();
        await vesting.setCoin(TokenUSD.address, FromSum18(1));
        await expect(vesting.setSale(governance.address, FromSum18(5000),
            Price,
            SaleStart, SaleStart + 1000,
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
        const balance = await TokenUSD.balanceOf(this.owner1.address)
        expect(balance).to.be.equal(FromSum18(800));
    });

    it('should not be possible to buyToken() if block.timestamp <= timeStart', async function () {

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
        await expect(vesting.buyToken(governance.address,
            SaleStart + 500,
            TokenUSD.address, FromSum18(100)))
            .to
            .be
            .rejectedWith('Error, The sales Start time has not yet arrived');
    });
    it('should not be possible to buyToken() if rate=0', async function () {

        let governance = await this.governanceTokenFactory.deploy(FromSum18(1e6));
        await governance.Mint(5000);

        let TokenUSD = await this.usdFactory.deploy();
        await TokenUSD.Mint(FromSum18(1000));

        let Price = FromSum18(2);

        //1000 + current block timestamo, because require(block.timestamp <= saleStart)
        let SaleStart = 1000 + (await time.latest());

        let timeCliff = SaleStart + 2000;

        let vesting = await this.vestingFactory.deploy();
        await vesting.setCoin(TokenUSD.address, 0);
        await vesting.setSale(governance.address, FromSum18(5000), Price, SaleStart, SaleStart + 1000, timeCliff, 7, 100, 10000);
        expect((await vesting.getSale(governance.address, SaleStart)).length).to.be.greaterThan(0);
        await TokenUSD.approve(vesting.address, FromSum18(1000));
        await expect(vesting.buyToken(governance.address,
            SaleStart,
            TokenUSD.address, FromSum18(100)))
            .to
            .be
            .rejectedWith('Error, The sales Start time has not yet arrived');
    });

    it('should not be possible to buyToken() if Amount = 0', async function () {
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
        await expect(vesting.buyToken(governance.address,
            SaleStart,
            TokenUSD.address, 0))
            .to
            .be
            .rejectedWith('Amount is zero');
    });
    it('should not be possible to buyToken() if info.Amount < amount', async function () {
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
        await expect(vesting.buyToken(governance.address,
            SaleStart,
            TokenUSD.address, FromSum18(10000)))
            .to
            .be
            .rejectedWith('Not enough tokens on the Sale');
    });

    // it seems info.Expires>0 cannot be tested
    // it seems info.Price > 0 cannot be tested
    // setSale blocks those tests


    it('should withdraw', async function () {
        let governance = await this.governanceTokenFactory.deploy(FromSum18(1e6));
        let TokenUSD = await this.usdFactory.deploy();
        await TokenUSD.Mint(FromSum18(1000));

        let Price = FromSum18(2);
        let SaleStart = 1000 + (await time.latest());
        let timeCliff = SaleStart + 2000;
        let vesting = await this.vestingFactory.deploy();
        await governance.Mint(FromSum18(5000));
        let balance = await governance.balanceOf(governance.address);
        expect(balance).to.be.equal("5000000000000000000000"); // BigNumber { value: "5000" }
        // governance.transferToken transfers token from contract balance to recipient
        await governance.transferToken(vesting.address, FromSum18(5000));

        await vesting.setCoin(TokenUSD.address, FromSum18(1));
        await vesting.setSale(governance.address, FromSum18(5000), Price, SaleStart, SaleStart + 1000, timeCliff, 7, 100, 10000);
        await time.increaseTo(SaleStart + 2);
        await TokenUSD.approve(vesting.address, FromSum18(1000));
        await vesting.buyToken(governance.address, SaleStart, TokenUSD.address, FromSum18(100));
        await time.increaseTo(timeCliff + 1);
        await vesting.withdraw(governance.address, SaleStart);
        expect(await governance.balanceOf(this.owner1.address)).to.be.equal(FromSum18(10));
        expect(await governance.balanceOf(vesting.address)).to.be.equal(FromSum18(4990))
    });
    /*
    withdraw
    
    withdrawCoins
    withdrawEth
    balanceOf
    getSale
    */

})
