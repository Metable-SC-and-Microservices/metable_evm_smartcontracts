const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GameToken methods", async function () {
    before(async function () {
        [this.owner1, this.owner2] = await ethers.getSigners();
        this.gameToken = await ethers.getContractFactory("contracts/GameToken.sol:GameToken"); //  for buy things
        this.utility = await this.gameToken.deploy();
    });

    it('should be possible to Mint() gametokens', async function () {
        expect(await this.utility.balanceOf(this.utility.address)).to.be.equal(0);
        this.utility.Mint("1000000000000000000000");
        let bal = await this.utility.balanceOf(this.utility.address);
        expect(bal).to.be.equal("1000000000000000000000");

    });

    it('should be possible to MintTo() gametokens', async function () {
        expect(await this.utility.balanceOf(this.owner1.address)).to.be.equal(0);
        await this.utility.MintTo(this.owner1.address, "10");
        let bal = await this.utility.balanceOf(this.owner1.address);
        expect(bal).to.be.equal("10");

    });

    it('should not be possible to Mint() if not owner', async function () {
        let ut2 = await this.utility.connect(this.owner2);
        await expect(ut2.Mint("1000000000000000000000")).to.be.revertedWith("Ownable: caller is not the owner")
    });
    it('should not be possible to MintTo() if not owner', async function () {
        let ut2 = await this.utility.connect(this.owner2);
        await expect(ut2.MintTo(this.owner2.address, "10")).to.be.revertedWith("Ownable: caller is not the owner")
    });

    it('should  be possible to SmartTransferTo if caller is onlySmart', async function () {
        await this.utility.setSmart(this.owner1.address)

        await this.utility.SmartTransferTo(this.owner1.address,
            this.owner2.address, "10");
        
    })

    it('should not be possible to SmartTransferTo if caller is not onlySmart', async function () {
        let ut2 = await this.utility.connect(this.owner2);
        await expect(ut2.SmartTransferTo(this.owner2.address,
            this.owner1.address, "10"))
            .to
            .be
            .revertedWith("Error smart allower")
    })

    it('should be possible to transferToken', async function() {
        this.utility.Mint("1000000000000000000000");
        expect(await this.utility.balanceOf(this.owner1.address)).to.be.equal(0);
        // from smart contract to address
        this.utility.transferToken(this.owner1.address, "10");
        expect(await this.utility.balanceOf(this.owner1.address)).to.be.equal(10);
    })
    it('should not be possible to transferToken if not owner', async function() {
        this.utility.Mint("1000000000000000000000");
        let ut2 = await this.utility.connect(this.owner2);
        await expect(ut2.transferToken(this.owner1.address, "10")).to.be.revertedWith("Ownable: caller is not the owner");
    })

});

