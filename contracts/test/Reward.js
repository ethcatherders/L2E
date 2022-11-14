const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BASE_URI, deployReward } = require("../utils/helpers");

describe("Reward", function() {
  describe("Deployment", function () {
    it("Should deploy successfully", async function() {
      const { reward } = await deployReward(0)
      expect(reward.address)
    })

    it("Should set ownership to deployer", async function () {
      const [account0, account1] = await ethers.getSigners()
      const { reward: reward0 } = await deployReward(0)
      const { reward: reward1 } = await deployReward(1)

      expect(await reward0.owner()).to.equal(account0.address)
      expect(await reward1.owner()).to.equal(account1.address)
    })
  })

  describe("Mint", function () {
    it("Should mint and transfer token to 'to' address", async function () {
      const [,account1] = await ethers.getSigners()
      const { reward } = await deployReward(0)
      await expect(reward.connect(account1).mint()).to.be.not.reverted
      expect(await reward.balanceOf(account1.address)).to.equal(1)
    })

    it("Should mint and set _claimed mapping of 'to' address as true", async function () {
      const [,account1] = await ethers.getSigners()
      const { reward } = await deployReward(0)
      expect(await reward.claimed(account1.address)).to.be.false
      await expect(reward.connect(account1).mint()).to.be.not.reverted
      expect(await reward.claimed(account1.address)).to.be.true
    })

    it("Should revert mint if 'to' address already claimed", async function () {
      const [,account1] = await ethers.getSigners()
      const { reward } = await deployReward(0)
      await expect(reward.connect(account1).mint())
        .to.be.not.reverted
      expect(await reward.claimed(account1.address)).to.be.true
      await expect(reward.connect(account1).mint())
        .to.be.revertedWith("Reward: recipient already claimed")
    })

    it("Should revert mint if balanceOf to address is greater than 0", async function () {
      const [,account1, account2] = await ethers.getSigners()
      const { reward } = await deployReward(0)
      await expect(reward.connect(account1).mint())
        .to.be.not.reverted
      const tokenId = await reward.supply()
      await reward.connect(account1).transferFrom(account1.address, account2.address, tokenId)
      expect(await reward.balanceOf(account2.address)).to.equal(1)
      await expect(reward.connect(account2).mint())
        .to.be.revertedWith("Reward: recipient balance greater than 0")
    })

    xit("Should revert mint if non-owner executes tx", async function () {
      const [,account1,account2] = await ethers.getSigners()
      const { reward } = await deployReward(0)
      await expect(reward.connect(account1).mint(account2.address))
        .to.be.revertedWith("Ownable: caller is not the owner")
    })
  })

  describe("Claimed", function () {
    xit("Should revert claimed if non-owner calls function", async function () {
      const [,account1] = await ethers.getSigners()
      const { reward } = await deployReward(0)
      await expect(reward.connect(account1).claimed(account1.address))
        .to.be.revertedWith("Ownable: caller is not the owner")
    })
  })

  describe("TokenURI", function () {
    it("tokenURI should be exact same for all tokenIds", async function () {
      const [,account1, account2] = await ethers.getSigners()
      const { reward } = await deployReward(0)
      await reward.connect(account1).mint()
      await reward.connect(account2).mint()
      expect(await reward.tokenURI(1)).to.equal(await reward.tokenURI(1)).and.equal(BASE_URI)
    })
  })
})