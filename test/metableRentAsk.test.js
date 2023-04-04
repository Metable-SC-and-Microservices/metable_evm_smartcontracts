const { expect } = require("chai");
const { ethers } = require("hardhat");
const LAND = "land";
const BUILD = "build";
const PriceSale = "30000000000000000000";
const newPriceSale = "45000000000000000000";

describe("MetableRentAsk methods", async function () {
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

  // setRentAsk
  // removeRentAsk
  // approveRentAsk
  // lengthRentAsk
  // listRentAsk
  
});