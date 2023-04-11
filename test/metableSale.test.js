const { expect } = require("chai");
const { ethers } = require("hardhat");
const LAND = "land";
const BUILD = "build";
const PriceSale = "30000000000000000000";
const newPriceSale = "45000000000000000000";

describe("MetableSale methods", async function () {
  before(async function () {
    let PriceToken = 1 * 1e9;

    [this.owner1, this.owner2] = await ethers.getSigners();
    this.metableFactory = await ethers.getContractFactory("contracts/Metable.sol:Metable");
    this.courseNFT = await ethers.getContractFactory("contracts/CoursesNFT.sol:CoursesNFT");
    this.gameToken = await ethers.getContractFactory("contracts/GameToken.sol:GameToken"); //  for buy things

    this.utility = await this.gameToken.deploy();
    await this.utility.Mint("1000000000000000000000");
    await this.utility.setSale("500000000000000000000", PriceToken);
    await this.utility.buyToken({ value: 200 * PriceToken });
    let ut2 = await this.utility.connect(this.owner2);
    await ut2.buyToken({ value: 200 * PriceToken });
    expect(await this.utility.balanceOf(this.utility.address)).to.be.equal("600000000000000000000");

    this.course = await this.courseNFT.deploy();
    this.metable = await this.metableFactory.deploy(this.utility.address, this.course.address,);
    await this.utility.setSmart(this.metable.address);

    const Meta1 = "Meta1";
    const Meta2 = "Meta2";
    const Meta3 = "Meta3";
    const Meta4 = "Meta4";
    const Meta5 = "Meta5";
    const Meta6 = "Meta6";

    await this.metable.Mint(LAND, "land", Meta1, 2, 0, PriceSale, 1);//1
    await this.metable.Mint(LAND, "land", Meta2, 3, 0, PriceSale, 1);//2
    await this.metable.Mint(BUILD, "school", Meta3, 6, 3, PriceSale, 1);//3
    await this.metable.Mint(BUILD, "hospital", Meta4, 8, 2, PriceSale, 1);//4
    await this.metable.Mint(BUILD, "hospital", Meta5, 8, 0, PriceSale, 1);//5
    await this.metable.Mint(BUILD, "school", Meta6, 6, 0, PriceSale, 1);//6

  });

  it("should be possible to buy an NFT", async function () {
    await this.metable.buyNFT(6);
    expect(await this.metable.ownerOf(6)).to.be.equal(this.owner1.address);
  });

  it("should not be possible to buy an NFT if id does not exist", async function () {
    await expect( this.metable.buyNFT(7)).to.be.revertedWith("EnumerableMap: nonexistent key");
  });

  it("should be possible to put an NFT on sale", async function () {
    await this.metable.buyNFT(1);
    await this.metable.setSale(1, newPriceSale);
    const saleList = await this.metable.listSale(0, 10);
    expect(saleList[saleList.length - 1].Owner).to.be.equal(this.owner1.address);
    expect(saleList[saleList.length - 1].Price).to.be.equal(newPriceSale);
  });

  it("should correctly remove an NFT from sale", async function () {
    await this.metable.buyNFT(1);
    await this.metable.setSale(1, newPriceSale);
    var saleList = await this.metable.listSale(0, 10);
    expect(saleList[saleList.length - 1].Owner).to.be.equal(this.owner1.address);
    expect(saleList[saleList.length - 1].Price).to.be.equal(newPriceSale);
    await this.metable.removeSale(1);
    saleList = await this.metable.listSale(0, 10);
    expect(saleList[saleList.length - 1].Owner).to.be.not.equal(this.owner1.address);
  });

  it("should not be possible to remove from sale an NFT not owned", async function () {
    await expect(this.metable.removeSale(1)).to.be.revertedWith("removeSale::Sender not NFT owner");
  });

});