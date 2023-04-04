const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PrimaryNFT methods", function () {
    it("it should deploy a MetableNFT with correct name and symbol", async function() {
      const metableNFTFactory = await ethers.getContractFactory("contracts/MetableNFT.sol:MetableNFT");
      const metableNFT = await metableNFTFactory.deploy();
      const name = await metableNFT.name();
      const symbol = await metableNFT.symbol();
      expect(name).to.be.equal("Metable NFT");
      expect(symbol).to.be.equal("MTB-NFT");
    }); 

    it("it should correctly setBaseURI", async function () {
      const tokenURI = "https://www.myserver.com/metadata/";
      const metableNFTFactory = await ethers.getContractFactory("contracts/MetableNFT.sol:MetableNFT");
      const metableNFT = await metableNFTFactory.deploy();
      await metableNFT.setBaseURI(tokenURI)
      let uri = await metableNFT.baseTokenURI();
      expect(uri).to.be.equal(tokenURI);
    });
  });