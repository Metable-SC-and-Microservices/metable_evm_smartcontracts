const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
function FromSum18(Sum) {
    return hre.ethers.utils.parseUnits(String(Sum), 18);
}


describe("Staking methods", function () {
    before(async function () {
        [this.owner1, this.owner2] = await ethers.getSigners();
        this.stakingFactory = await ethers.getContractFactory("contracts/Staking.sol:Staking");
        this.governanceTokenFactory = await ethers.getContractFactory("contracts/GovernanceToken.sol:GovernanceToken");

    })

    it('should setStaking()/getStakingAmount()', async function () {
        let governance = await this.governanceTokenFactory.deploy(FromSum18(1e6));
        await governance.Mint(FromSum18(5000));
        let staking = await this.stakingFactory.deploy(governance.address);
        await governance.setSmart(staking.address);
        await governance.transferToken(this.owner1.address, FromSum18(5000));
        await staking.setStaking(FromSum18(100));
        expect(await staking.getStakingAmount(this.owner1.address)).to.be.equal(FromSum18(100));
    });
    it('should not be possible to setStaking() if amount=0', async function () {
        let governance = await this.governanceTokenFactory.deploy(FromSum18(1e6));
        await governance.Mint(FromSum18(5000));
        let staking = await this.stakingFactory.deploy(governance.address);
        await governance.setSmart(staking.address);
        await governance.transferToken(this.owner1.address, FromSum18(5000));
        await expect(staking.setStaking(FromSum18(0))).to.be.revertedWith('Amount is zero')
    });
    it('should removeStaking()', async function () {
        let governance = await this.governanceTokenFactory.deploy(FromSum18(1e6));
        await governance.Mint(FromSum18(5000));
        let staking = await this.stakingFactory.deploy(governance.address);
        await governance.setSmart(staking.address);
        await governance.transferToken(this.owner1.address, FromSum18(5000));
        await staking.setStaking(FromSum18(100));
        await staking.removeStaking(FromSum18(10));
        expect(await staking.getStakingAmount(this.owner1.address)).to.be.equal(FromSum18(90));
    });
    it('should not be possible to removeStaking() if amount = 0', async function () {
        let governance = await this.governanceTokenFactory.deploy(FromSum18(1e6));
        await governance.Mint(FromSum18(5000));
        let staking = await this.stakingFactory.deploy(governance.address);
        await governance.setSmart(staking.address);
        await governance.transferToken(this.owner1.address, FromSum18(5000));
        await staking.setStaking(FromSum18(100));
        await expect(staking.removeStaking(FromSum18(0))).to.be.revertedWith('Amount is zero');
    });

    it('should not be possible to removeStaking() if Balance < amount', async function () {
        let governance = await this.governanceTokenFactory.deploy(FromSum18(1e6));
        await governance.Mint(FromSum18(5000));
        let staking = await this.stakingFactory.deploy(governance.address);
        await governance.setSmart(staking.address);
        await governance.transferToken(this.owner1.address, FromSum18(5000));
        await staking.setStaking(FromSum18(100));
        await expect(staking.removeStaking(FromSum18(101))).to.be.revertedWith('Insufficient stake funds');
    });
   
    /**
     * constructor
     * setStaking
     * removeStaking
     * getStakingAmount
     */
});