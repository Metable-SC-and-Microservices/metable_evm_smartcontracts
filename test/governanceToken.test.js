const { expect } = require("chai");
const { ethers } = require("hardhat");
function FromSum18(Sum) {
    return hre.ethers.utils.parseUnits(String(Sum), 18);
}
describe("GovernanceNFT methods", async function () {
    before(async function () {

        [this.owner1, this.owner2] = await ethers.getSigners();
        this.governanceToken = await ethers.getContractFactory("contracts/GovernanceToken.sol:GovernanceToken"); //  for buy things
        this.stakingFactory = await ethers.getContractFactory("contracts/Staking.sol:Staking"); //  for buy things
        // this.governance = await this.governanceToken.deploy(FromSum18(1e6));
        // this.staking = await this.stakingFactory.deploy(this.governance.address);
    });

    it('it should be possible to set a cap to governance tokens when deploy()', async function () {
        this.governance = await this.governanceToken.deploy(FromSum18(1e6));
        expect(await this.governance.cap()).to.be.equal(FromSum18(1e6));
    })

    it('should be possible to Mint() n <= cap tokens', async function () {
        let governance = await this.governanceToken.deploy(FromSum18(1e6));
        await governance.Mint(10);
        expect(await governance.balanceOf(governance.address)).to.be.equal(10);
    });

    it('should not be possible to Mint() n > cap tokens', async function () {
        await expect(this.governance.Mint(FromSum18(1e6 + 1))).to.be.revertedWith("ERC20Capped: cap exceeded");
    });

    it('should be possible to MintTo()', async function () {
        expect(await this.governance.balanceOf(this.owner1.address)).to.be.equal(0);
        await this.governance.MintTo(this.owner1.address, "10");
        let bal = await this.governance.balanceOf(this.owner1.address);
        expect(bal).to.be.equal("10");
    });

    it('should not be possible to Mint() if not owner', async function () {
        let ut2 = await this.governance.connect(this.owner2);
        await expect(ut2.Mint("10")).to.be.revertedWith("Ownable: caller is not the owner")
    });

    it('should not be possible to MintTo() if not owner', async function () {
        let ut2 = await this.governance.connect(this.owner2);
        await expect(ut2.MintTo(this.owner2.address, "10")).to.be.revertedWith("Ownable: caller is not the owner")
    });

    it('should be possible to transferToken', async function () {
        await this.governance.Mint("10");
        expect(await this.governance.balanceOf(this.owner1.address)).to.be.equal(10);
        await this.governance.transferToken(this.owner1.address, "10");
        expect(await this.governance.balanceOf(this.owner1.address)).to.be.equal(20);
    })
    it('should be possible to SmartTransferTo', async function () {
        await this.governance.Mint("10");
        let governance = await this.governanceToken.deploy(FromSum18(1e6));
        let staking = await this.stakingFactory.deploy(governance.address);
        await governance.setSmart(staking.address); // from common.js, why?
        // to be continued...
    })
    it('should not be possible to transferToken if not owner', async function () {
        await this.governance.Mint("10");
        let ut2 = await this.governance.connect(this.owner2);
        await expect(ut2.transferToken(this.owner1.address, "10")).to.be.revertedWith("Ownable: caller is not the owner");
    });

});