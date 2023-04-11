const { expect } = require("chai");
const { ethers } = require("hardhat");
const LAND = "land";
const BUILD = "build";
const PriceSale = "30000000000000000000";

describe("Metable methods", async function () {
    before(async function () {
        let PriceToken = 1 * 1e9;

        [this.owner1, this.owner2] = await ethers.getSigners();
        this.metableFactory = await ethers.getContractFactory("contracts/Metable.sol:Metable");
        this.courseNFT = await ethers.getContractFactory("contracts/CoursesNFT.sol:CoursesNFT");
        this.gameToken = await ethers.getContractFactory("contracts/GameToken.sol:GameToken"); //  for buy things

        this.utility = await this.gameToken.deploy();

        this.course = await this.courseNFT.deploy();
        this.metable = await this.metableFactory.deploy(this.utility.address, this.course.address,);
        await this.utility.setSmart(this.metable.address);

    });

    it("should be possible to Mint()", async function () {
        let minted = await this.metable.Mint(LAND, "land", "metadata1", 2, 0, PriceSale, 1);
        let receipt = await minted.wait();
        let events = receipt.events?.filter((x) => { return x.event == "Transfer" });
        expect(events.length).to.be.greaterThan(0);
    });

    it("should not be possible to Mint() if not owner", async function () {
        let met2 = await this.metable.connect(this.owner2);
        await expect(met2.Mint(LAND, "land", "metadata1", 2, 0, PriceSale, 1)).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should be possible to transferToken()", async function () {
        await this.utility.Mint("10");
        await this.utility.transferToken(this.metable.address, "10");
        expect(await this.utility.balanceOf(this.metable.address)).to.be.equal(10);
        expect(await this.utility.balanceOf(this.owner2.address)).to.be.equal(0);
        // metable contract can transfer owned utility tokens
        await this.metable.transferToken(this.owner2.address, "10");
        expect(await this.utility.balanceOf(this.owner2.address)).to.be.equal(10);
        expect(await this.utility.balanceOf(this.metable.address)).to.be.equal(0);

    })
    it("should be possible to withdrawToken()", async function () {
        await this.utility.Mint("10");
        await this.utility.transferToken(this.metable.address, "10");
        expect(await this.utility.balanceOf(this.metable.address)).to.be.equal(10);
        expect(await this.utility.balanceOf(this.owner1.address)).to.be.equal(0);
        await this.metable.withdrawToken();
        expect(await this.utility.balanceOf(this.owner1.address)).to.be.equal(10);
        expect(await this.utility.balanceOf(this.metable.address)).to.be.equal(0);

    })

});