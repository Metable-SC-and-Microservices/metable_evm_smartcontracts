const { expect } = require("chai");
const { ethers } = require("hardhat");
const LAND = "land";
const BUILD = "build";
const PriceSale = "30000000000000000000";
const PriceRent = "3000000000000000000";

describe("MetableRentBid methods", async function () {
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
    await this.metable.Mint(BUILD, "hospital", Meta5, 8, 3, PriceSale, 1);//5
    await this.metable.Mint(BUILD, "school", Meta6, 6, 0, PriceSale, 1);//6

  });

  // setRentBid
  it('should be possible to setRentBid', async function () {
    // owner1 buys token 3, a school with 3 rent slots
    await this.metable.buyNFT(3);
    await this.metable.setRentBid(3, PriceRent, 1, 1);
    let bidList = await this.metable.listRentBid(0, 10);
    expect(bidList[0].ID).to.be.equal(3);
  });

  it('should not be possible to setRentBid with price = 0', async function () {
    await expect(this.metable.setRentBid(3, "0", 1, 1)).to.be.revertedWith("setRentBid::Price is zero");
  });

  it('should not be possible to setRentBid with period = 0', async function () {
    await expect(this.metable.setRentBid(3, PriceRent, 0, 1)).to.be.revertedWith("setRentBid::Period is zero");
  });
  // removeRentBid
  it('should be possible to removeRentBid', async function () {
    await this.metable.buyNFT(4);
    await this.metable.setRentBid(4, PriceRent, 1, 1);
    var bidList = await this.metable.listRentBid(0, 10);
    expect(bidList[1].ID).to.be.equal(4);
    expect(bidList.length).to.be.equal(2);
    await this.metable.removeRentBid(4);
    bidList = await this.metable.listRentBid(0, 10);
    expect(bidList.length).to.be.equal(1);
  });

  it('should be not possible to removeRentBid if not owner', async function () {
    let met2 = this.metable.connect(this.owner2);
    await expect(met2.removeRentBid(3)).to.be.revertedWith("Error NFT owner");
  });

  it('should be possible to buyRentBid', async function () {
    await this.metable.buyNFT(5);
    await this.metable.setRentBid(5, PriceRent, 1, 1);
    // this.owner2 asks for rent
    let met2 = await this.metable.connect(this.owner2);
    await met2.setRentAsk(5, PriceRent, 1);
    // index seems to have no effect
    await met2.buyRentBid(5, 1);
  });
  it('should be possible to buyRentSchoolBid', async function () {
    let info = await this.metable.getInfo(3);
    let met2 = await this.metable.connect(this.owner2);
    await this.course.Mint("CourseMetadata1");
    await this.metable.buyRentSchoolBid(3,1,1);
  });
  // lengthRentBid
  // listRentBid
});