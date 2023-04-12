const { expect } = require("chai");
const { ethers } = require("hardhat");
const LAND = "land";
const BUILD = "build";
const PriceTicket = "2000000000000000000";
const PriceSale = "30000000000000000000";
const PriceToken = 1 * 1e9;


describe("Tickets methods", function () {
  before(async function () {
    [this.owner1, this.owner2] = await ethers.getSigners();
    this.metableFactory = await ethers.getContractFactory("contracts/Metable.sol:Metable");
    this.ticketsFactory = await ethers.getContractFactory("contracts/Tickets.sol:Tickets");
    this.courseNFT = await ethers.getContractFactory("contracts/CoursesNFT.sol:CoursesNFT");
    this.gameToken = await ethers.getContractFactory("contracts/GameToken.sol:GameToken"); //  for buy things
    this.utility = await this.gameToken.deploy();
    this.course = await this.courseNFT.deploy();
    this.metable = await this.metableFactory.deploy(this.utility.address, this.course.address,);
    await this.utility.setSmart(this.metable.address);
    await this.utility.setSmart(this.course.address);
    await this.utility.Mint("1000000000000000000000");
    await this.utility.setSale("500000000000000000000", PriceToken);
    await this.utility.buyToken({ value: 200 * PriceToken });

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
    await this.metable.Mint(BUILD, "school", Meta6, 6, 0, PriceSale, 1);//7

  });

  // constructor
  it('is possible to deploy Tickets', async function () {
    const tickets = await this.ticketsFactory.deploy(this.metable.address, this.utility.address, this.course.address);
    expect(tickets.address).to.be.not.equal(ethers.constants.AddressZero);
  });

  it('is possible to issueTickets()', async function () {
    const tickets = await this.ticketsFactory.deploy(this.metable.address, this.utility.address, this.course.address);
    await this.course.Mint("{number:1}");
    await expect(tickets.issueTickets(1, 100, PriceTicket)).to.not.be.reverted;
  });

  it('is should not be possible to issueTickets() if amount = 0', async function () {
    const tickets = await this.ticketsFactory.deploy(this.metable.address, this.utility.address, this.course.address);
    await this.course.Mint("{number:2}");
    await expect(tickets.issueTickets(2, 0, PriceTicket)).to.be.revertedWith('issueTickets::Error amount issue');
  });

  it('is should not be possible to issueTickets() if price = 0', async function () {
    const tickets = await this.ticketsFactory.deploy(this.metable.address, this.utility.address, this.course.address);
    await this.course.Mint("{number:3}");
    await expect(tickets.issueTickets(3, 100, 0)).to.be.revertedWith('issueTickets::Error zero price');
  });
  it('is should not be possible to issueTickets() if not course owner', async function () {
    const tickets = await this.ticketsFactory.deploy(this.metable.address, this.utility.address, this.course.address);
    await this.course.Mint("{number:4}");
    const t2 = await tickets.connect(this.owner2);
    await expect(t2.issueTickets(4, 100, PriceTicket)).to.be.revertedWith('issueTickets::Error Course owner');
  });

  it('is possible to approveTickets()', async function () {
    const tickets = await this.ticketsFactory.deploy(this.metable.address, this.utility.address, this.course.address);
    await this.course.Mint("{number:5}");
    await tickets.issueTickets(5, 100, PriceTicket)
    await this.metable.buyNFT(6);//school
    await tickets.approveTickets(6, 5);
  });
  it('should not be possible to approveTickets() if amount = 0', async function () {
    const tickets = await this.ticketsFactory.deploy(this.metable.address, this.utility.address, this.course.address);
    await this.course.Mint("{number:6}");
    await tickets.issueTickets(6, 1, PriceTicket)
    await this.metable.buyNFT(3);//school
    await tickets.approveTickets(3, 6); // nftid, courseid
    // tickets issued = 1, buying another should not be possible
    await expect(tickets.approveTickets(3, 6)).to.be.revertedWith('approveTickets::Error amount issue');
  });
  it('should not be possible to approveTickets() if not school owner', async function () {
    const tickets = await this.ticketsFactory.deploy(this.metable.address, this.utility.address, this.course.address);
    await this.course.Mint("{number:7}");
    await tickets.issueTickets(7, 1, PriceTicket)
    await this.metable.buyNFT(7);//schoolid = 7
    const t2 = await tickets.connect(this.owner2);
    await expect(t2.approveTickets(7, 7)).to.be.revertedWith('approveTickets::Error school owner');
  });

  // SmartTransferTo
  // TODO

  it('should be possible to buyTickets()', async function () {
    const tickets = await this.ticketsFactory.deploy(this.metable.address, this.utility.address, this.course.address);
    await this.course.Mint("{number:8}");
    await tickets.issueTickets(8, 1, PriceTicket);
    await tickets.approveTickets(3, 8); // nftid, courseid
    await this.utility.setSmart(tickets.address);
    let transfer = await tickets.buyTickets(8, 1);
    let receipt = await transfer.wait();
    let events = receipt.events?.filter((x) => { return x.event == "TransferSingle" }); 
    expect(events.length).to.be.greaterThan(0);
  });

});