const { expect } = require("chai");
const { ethers } = require("hardhat");
function FromSum18(Sum) {
    return hre.ethers.utils.parseUnits(String(Sum), 18);
}
describe("GameToken methods", async function () {
    before(async function () {
        [this.owner1, this.owner2] = await ethers.getSigners();
        this.gameToken = await ethers.getContractFactory("contracts/GameToken.sol:GameToken"); //  for buy things
        this.utility = await this.gameToken.deploy();
    });

    it('should be possible to Mint() gametokens', async function () {
        expect(await this.utility.balanceOf(this.utility.address)).to.be.equal(0);
        this.utility.Mint("10");
        let bal = await this.utility.balanceOf(this.utility.address);
        expect(bal).to.be.equal("10");

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

    it('should be possible to transferToken', async function () {
        this.utility.Mint("10");
        expect(await this.utility.balanceOf(this.owner1.address)).to.be.equal(0);
        this.utility.transferToken(this.owner1.address, "10");
        expect(await this.utility.balanceOf(this.owner1.address)).to.be.equal(10);
    })
    it('should not be possible to transferToken if not owner', async function () {
        this.utility.Mint("10");
        let ut2 = await this.utility.connect(this.owner2);
        await expect(ut2.transferToken(this.owner1.address, "10")).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it('should be possible to setSale', async function () {
        await this.utility.Mint(100);
        await this.utility.setSale(100, BigInt(FromSum18(2)));
        expect(await this.utility.SalePrice()).to.be.equal(("2000000000000000000"));
        expect(await this.utility.SaleAmount()).to.be.equal(BigInt("100"));
    })

    it('should be possible to buyToken()', async function () {
        let buy = await this.utility.buyToken({ value: 2 });
        let receipt = await buy.wait();
        // console.log(receipt.events?.filter((x) => { return x.event == "Transfer" }));
        expect(await this.utility.balanceOf(this.owner1.address)).to.be.equal(11);
    })

    it('should be possible to buyToken() if SalePrice=0', async function () {
        await this.utility.setSale(100, BigInt(FromSum18(0)));
        await expect(this.utility.buyToken({ value: 2 })).to.be.revertedWith("Sale Price is zero");
    })
    it('should be possible to buyToken() if needAmount=0', async function () {
        await this.utility.setSale(100, BigInt(FromSum18(2)));
        await expect(this.utility.buyToken({ value: 1 })).to.be.revertedWith("Need Amount is zero");
    })
    it('should be possible to buyToken() if SaleAmount >= needAmount', async function () {
        await this.utility.setSale(1, BigInt(FromSum18(1)));
        await expect(this.utility.buyToken({ value: 2 })).to.be.revertedWith("Not enough tokens on the Sale");
    })
    it('should be possible to buyToken() if there are not enough tokens on Smart Contract',
        async function () {
            let scBalance = await this.utility.balanceOf(this.utility.address);
            // remove all tokens
            await this.utility.withdrawToken(this.utility.address);
            scBalance = await this.utility.balanceOf(this.utility.address);
            await this.utility.setSale(1, BigInt(FromSum18(1)));
            await expect(this.utility.buyToken({ value: 1 })).to.be.revertedWith("Not enough tokens on the smart contract");
        })

    it('should be possible to withdraw()', async function () {
        await this.utility.withdraw();
        const cb = await ethers.provider.getBalance(this.utility.address)
        expect(cb).to.be.equal(0);
        // check transfer event from contract to owner1?
    })
    it('should be possible to withdrawToken()', async function () {
        await this.utility.Mint(100);
        expect(await this.utility.balanceOf(this.utility.address)).to.be.greaterThan(0);
        await this.utility.withdrawToken(this.utility.address);
        expect(await this.utility.balanceOf(this.utility.address)).to.be.equal(0);
    })

    it('should not be possible to withdraw() if not owner', async function () {
        let ut2 = this.utility.connect(this.owner2);
        await expect(ut2.withdraw()).to.be.revertedWith("Ownable: caller is not the owner");
    })

});

