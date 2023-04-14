const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Certificate methods", function () {
    before(async function () {
        [this.owner1, this.owner2] = await ethers.getSigners();
        this.metableFactory = await ethers.getContractFactory("contracts/Metable.sol:Metable");
        this.certificateFactory = await ethers.getContractFactory("contracts/Certificate.sol:Certificate");
    });

    it('should Mint()', async function () {
        let certificate = await this.certificateFactory.deploy();
        let courseId = 1n;
        let id = (courseId << 48n) + 1n; //1n is current id number
        await certificate.Mint(this.owner1.address, 1);
        expect(await certificate.ownerOf(id)).to.be.equal(this.owner1.address);
    });
    it('should Burn()', async function () {
        let certificate = await this.certificateFactory.deploy();
        let courseId = 1n;
        let id = (courseId << 48n) + 1n; //1n is current id number
        await certificate.Mint(this.owner1.address, 1);
        await certificate.Burn(id);
        await expect(certificate.ownerOf(id)).to.be.revertedWith("ERC721: invalid token ID");
    });
    it('should not be possible to Mint() if not owner', async function () {
        let certificate = await this.certificateFactory.deploy();
        let c2 = await certificate.connect(this.owner2);
        await expect(c2.Mint(this.owner1.address, 1)).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it('should not be possible to Burn() if not owner', async function () {
        let certificate = await this.certificateFactory.deploy();
        let c2 = await certificate.connect(this.owner2);
        let courseId = 1n;
        let id = (courseId << 48n) + 1n; //1n is current id number
        await certificate.Mint(this.owner1.address, 1);
        await expect(c2.Burn(id)).to.be.revertedWith("Ownable: caller is not the owner");
    });
});