const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CoursesNFT methods", function () {
    before(async function () {
        [this.owner1, this.owner2] = await ethers.getSigners();
        this.metableFactory = await ethers.getContractFactory("contracts/Metable.sol:Metable");
        this.courseNFT = await ethers.getContractFactory("contracts/CoursesNFT.sol:CoursesNFT");
    });

    it('should Mint()', async function () {
        let courses = await this.courseNFT.deploy();
        await courses.Mint("{number:1}");
        expect(await courses.ownerOf(1)).to.be.equal(this.owner1.address);
        expect(await courses.getMetadata(1)).to.be.equal("{number:1}");
    });

    it('should setMetadata()', async function () {
        let courses = await this.courseNFT.deploy();
        await courses.Mint("{number:1}");
        expect(await courses.getMetadata(1)).to.be.equal("{number:1}");
        await courses.setMetadata(1, "{number:2}");
        expect(await courses.getMetadata(1)).to.be.equal("{number:2}");
    });
    it('should not be possible to setMetadata() if tokenId does not exists', async function () {
        let courses = await this.courseNFT.deploy();
        await courses.Mint("{number:1}");
        expect(await courses.getMetadata(1)).to.be.equal("{number:1}");
        await expect(courses.setMetadata(2, "{number:2}")).to.be.revertedWith('ERC721: invalid token ID');
    });
    it('should not be possible to getMetadata() if tokenId does not exists', async function () {
        let courses = await this.courseNFT.deploy();
        await courses.Mint("{number:1}");
        await expect(courses.getMetadata(2)).to.be.revertedWith('ERC721: invalid token ID');
    });


});