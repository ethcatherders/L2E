const { expect } = require("chai");
const { ethers } = require("hardhat");
const { NAME, SYMBOL, BASE_URI, deployReward } = require("../utils/helpers");

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

  describe("Initialization", async function () {
    it("Should init and set proper states", async function () {
      const { reward, accounts } = await deployReward(0)
      const [,account1] = accounts
      await reward.init(NAME, SYMBOL, BASE_URI, account1.address)
      await reward.mint()

      expect(await reward.owner()).to.equal(account1.address)
      expect(await reward.name()).to.equal(NAME)
      expect(await reward.symbol()).to.equal(SYMBOL)
      expect(await reward.tokenURI(1)).to.equal(BASE_URI)
    })
    
    it("Should revert init if initLock", async function () {
      const { reward, accounts } = await deployReward(0)
      const [account0] = accounts
      await reward.initLock()
      const tx = reward.init(NAME, SYMBOL, BASE_URI, account0.address)
      await expect(tx).to.be.reverted
    })

    it("Should revert if baseURI param is empty string", async function () {
      const { reward, accounts } = await deployReward(0)
      const [account0] = accounts
      const tx = reward.init(NAME, SYMBOL, "", account0.address)
      await expect(tx).to.be.revertedWith("Reward: no baseURI")
    })

    it("Should revert if name param is empty string", async function () {
      const { reward, accounts } = await deployReward(0)
      const [account0] = accounts
      const tx = reward.init("", SYMBOL, BASE_URI, account0.address)
      await expect(tx).to.be.revertedWith("Reward: no name")
    })

    it("Should revert if symbol param is empty string", async function () {
      const { reward, accounts } = await deployReward(0)
      const [account0] = accounts
      const tx = reward.init(NAME, "", BASE_URI, account0.address)
      await expect(tx).to.be.revertedWith("Reward: no symbol")
    })

    it("Should revert if assignedOwner param is null address", async function () {
      const { reward } = await deployReward(0)
      const tx = reward.init(NAME, SYMBOL, BASE_URI, "0x0000000000000000000000000000000000000000")
      await expect(tx).to.be.revertedWith("Reward: no assignedOwner")
    })
  })
  
  describe("Mint", function () {
    it("Should mint and transfer token to msg.sender", async function () {
      const { reward, accounts } = await deployReward(0)
      const [account0, account1] = accounts
      await reward.init(NAME, SYMBOL, BASE_URI, account0.address)
      await expect(reward.connect(account1).mint()).to.be.not.reverted
      expect(await reward.balanceOf(account1.address)).to.equal(1)
    })
    
    it("Should mint and set _claimed mapping of 'to' address as true", async function () {
      const { reward, accounts } = await deployReward(0)
      const [account0, account1] = accounts
      await reward.init(NAME, SYMBOL, BASE_URI, account0.address)
      expect(await reward.claimed(account1.address)).to.be.false
      await expect(reward.connect(account1).mint()).to.be.not.reverted
      expect(await reward.claimed(account1.address)).to.be.true
    })

    it("Should mint after unpause", async function () {
      const { reward, accounts } = await deployReward(0)
      const [account0, account1] = accounts
      await reward.init(NAME, SYMBOL, BASE_URI, account0.address)
      await reward.pause()
      await expect(reward.mint()).to.be.reverted
      await reward.unpause()
      await expect(reward.mint()).to.not.be.reverted
    })
    
    it("Should revert mint if not initialized", async function () {
      const { reward } = await deployReward(0)
      await expect(reward.mint()).to.be.revertedWith("Reward: contract not initialized")
    })

    it("Should revert mint if initLock", async function () {
      const { reward } = await deployReward(0)
      await reward.initLock()
      await expect(reward.mint()).to.be.revertedWith("Reward: contract not initialized")
    })

    it("Should revert mint if msg.sender already claimed", async function () {
      const { reward, accounts } = await deployReward(0)
      const [account0, account1] = accounts
      await reward.init(NAME, SYMBOL, BASE_URI, account0.address)
      await expect(reward.connect(account1).mint())
        .to.be.not.reverted
      expect(await reward.claimed(account1.address)).to.be.true
      await expect(reward.connect(account1).mint())
        .to.be.revertedWith("Reward: recipient already claimed")
    })

    it("Should revert mint if msg.sender already claimed and transferred", async function () {
      const { reward, accounts } = await deployReward(0)
      const [account0, account1] = accounts
      await reward.init(NAME, SYMBOL, BASE_URI, account0.address)
      await expect(reward.connect(account1).mint())
        .to.be.not.reverted
      expect(await reward.claimed(account1.address)).to.be.true
      await reward.connect(account1).transferFrom(account1.address, account0.address, 1)
      await expect(reward.connect(account1).mint())
        .to.be.revertedWith("Reward: recipient already claimed")
    })

    it("Should revert mint if balanceOf to address is greater than 0", async function () {
      const { reward, accounts } = await deployReward(0)
      const [account0, account1, account2] = accounts
      await reward.init(NAME, SYMBOL, BASE_URI, account0.address)
      await expect(reward.connect(account1).mint())
        .to.be.not.reverted
      const tokenId = await reward.supply()
      await reward.connect(account1).transferFrom(account1.address, account2.address, tokenId)
      expect(await reward.balanceOf(account2.address)).to.equal(1)
      await expect(reward.connect(account2).mint())
        .to.be.revertedWith("Reward: recipient balance greater than 0")
    })

    it("Should revert mint if paused", async function () {
      const { reward, accounts } = await deployReward(0)
      const [account0, account1] = accounts
      await reward.init(NAME, SYMBOL, BASE_URI, account0.address)
      await reward.connect(account0).pause()
      await expect(reward.connect(account1).mint()).to.be.reverted
    })
  })

  describe("Claimed", function () {
    it("Should check claimed and return false before mint", async function () {
      const { reward, accounts } = await deployReward(0)
      const [account0, account1] = accounts
      await reward.init(NAME, SYMBOL, BASE_URI, account0.address)
      expect(await reward.connect(account1).claimed(account1.address)).to.equal(false)
    })

    it("Should check claimed and return true after mint", async function () {
      const { reward, accounts } = await deployReward(0)
      const [account0, account1] = accounts
      await reward.init(NAME, SYMBOL, BASE_URI, account0.address)
      await reward.connect(account1).mint()
      expect(await reward.connect(account1).claimed(account1.address)).to.equal(true)
    })
  })

  describe("TokenURI", function () {
    it("tokenURI should be exact same for all tokenIds", async function () {
      const { reward, accounts } = await deployReward(0)
      const [account0, account1, account2] = accounts
      await reward.init(NAME, SYMBOL, BASE_URI, account0.address)
      await reward.connect(account1).mint()
      await reward.connect(account2).mint()
      expect(await reward.tokenURI(1)).to.equal(await reward.tokenURI(1)).and.equal(BASE_URI)
    })
  })

  describe("Enumerable", function () {
    it("Should tokenOfOwnerByIndex and get tokenId", async function () {
      const { reward, accounts } = await deployReward(0)
      const [account0, account1, account2] = accounts
      await reward.init(NAME, SYMBOL, BASE_URI, account0.address)
      await reward.connect(account1).mint()
      await reward.connect(account2).mint()
      expect(await reward.tokenOfOwnerByIndex(account1.address, 0))
        .to.equal(1)
      expect(await reward.tokenOfOwnerByIndex(account2.address, 0))
        .to.equal(2)
    })
  })

  describe("Pausable", function () {
    it("Should pause if owner", async function () {
      const { reward, accounts } = await deployReward(0)
      const [account0] = accounts
      await reward.init(NAME, SYMBOL, BASE_URI, account0.address)
      await expect(reward.pause()).to.be.not.reverted
    })

    it("Should unpause if owner", async function () { 
      const { reward, accounts } = await deployReward(0)
      const [account0] = accounts
      await reward.init(NAME, SYMBOL, BASE_URI, account0.address)
      await expect(reward.pause()).to.be.not.reverted
      await expect(reward.unpause()).to.be.not.reverted
    })

    it("Should revert pause if non-owner", async function () {
      const { reward, accounts } = await deployReward(0)
      const [account0, account1] = accounts
      await reward.init(NAME, SYMBOL, BASE_URI, account0.address)
      await expect(reward.connect(account1).pause()).to.be.reverted
    })

    it("Should revert unpause if non-owner", async function () {
      const { reward, accounts } = await deployReward(0)
      const [account0, account1] = accounts
      await reward.init(NAME, SYMBOL, BASE_URI, account0.address)
      await expect(reward.pause()).to.be.not.reverted
      await expect(reward.connect(account1).unpause()).to.be.reverted
    })
  })
})