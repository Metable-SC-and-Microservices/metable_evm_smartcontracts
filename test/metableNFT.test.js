const { expect } = require("chai");
const { ethers } = require("hardhat");
const LAND = "land";
const BUILD = "build";
const PriceSale = "30000000000000000000";

describe("MetableNFT methods", async function () {
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

    await this.metable.Mint(LAND, "land", Meta1, 2,0, PriceSale,1);//1
    await this.metable.Mint(LAND, "land", Meta2, 3,0, PriceSale,1);//2
    await this.metable.Mint(BUILD, "school", Meta3, 6,3, PriceSale,1);//3
    await this.metable.Mint(BUILD, "hospital", Meta4, 8,2, PriceSale,1);//4
    await this.metable.Mint(BUILD, "hospital", Meta5, 8,0, PriceSale,1);//5
    await this.metable.Mint(BUILD, "school", Meta6, 6,0, PriceSale,1);//6

  });

  it("should correctly getInfo", async function () {
    const info1 = await this.metable.getInfo(1);
    expect(info1[0]).to.be.equal(0);
  });

  it("should correctly getMetadata", async function () {
    const meta = await this.metable.getMetadata(1);
    expect(meta).to.be.equal("Meta1")
  });

  it("should correctly getNFTType", async function () {
    const t = await this.metable.getNFTType(1);
    expect(t).to.be.equal(LAND)
  });

  it("should correctly getNFTSubType", async function () {
    const subType = await this.metable.getNFTSubType(1);
    expect(subType).to.be.equal("land")
  });
  // how to test this?
  it("should correctly getLinkedToNFTs", async function () {
    const linkedSlots = await this.metable.getLinkedToNFTs(1);
    expect(linkedSlots.length).to.be.equal(0)
  });

  // maxslots - slots.length
  it("should correctly getFreeLinkedSlots", async function () {
    const freeSlots = await this.metable.getFreeLinkedSlots(1);
    expect(freeSlots).to.be.equal(2)
  });

  it("should correctly setMetadata", async function () {
    await this.metable.setMetadata(2, "changedMetadata");
    const info2 = await this.metable.getInfo(2);
    expect(info2[info2.length - 1]).to.be.equal("changedMetadata");
  });

  it("should correctly linkToNFT", async function () {
    await this.metable.buyNFT(1);
    await this.metable.buyNFT(2);
    await this.metable.linkToNFT(1, 2);
    const info1 = await this.metable.getInfo(1);
    expect(info1.ParentLink).to.be.equal(2);
  }); 

  it("should not linkToNFT if not parentId owner", async function () {
    // owner1 owns 1,2
    // owner2 buys 3
    let met2 = this.metable.connect(this.owner2);
    await met2.buyNFT(3);
    await expect(met2.linkToNFT(3, 1)).to.be.revertedWith("linkToNFT::Error Parent owner");
  });
  it("should not linkToNFT of not NFT owner", async function () {
    await expect(this.metable.linkToNFT(3, 1)).to.be.revertedWith("Error NFT owner");
  });


});