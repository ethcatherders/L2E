const { expect } = require("chai");
const { ethers } = require("hardhat");
const { NAME, SYMBOL, BASE_URI, deployRewardFactory, fetchCreateEvent } = require('../utils/helpers')

describe("RewardFactory", function() {
  describe("Deployment", function () {
    it("Should deploy successfully", async function() {
      const { factory } = await deployRewardFactory()
      expect(factory.address)
    })
  
    it("Should set ownership to deployer", async function () {
      const { factory } = await deployRewardFactory()
      const [owner] = await ethers.getSigners()
      expect(await factory.owner()).to.equal(owner.address)
    })
  })

  describe("Functions", function () {
    it("Should create and deploy new Reward contract", async function () {
      const {factory} = await deployRewardFactory()
      const [,account1] = await ethers.getSigners()

      const tx = await factory.create(NAME, SYMBOL, account1.address, BASE_URI)
      await tx.wait()

      const { contractAddress } = await fetchCreateEvent(factory, tx)
      
      const reward = new ethers.Contract(
        contractAddress,
        require('../artifacts/contracts/Reward.sol/Reward.json').abi,
        account1
      )

      expect(await reward.name()).to.equal(NAME)
      expect(await reward.symbol()).to.equal(SYMBOL)
    })

    it("Should create and transferOwnership to assignedOwner param", async function() {
      const {factory} = await deployRewardFactory()
      const [,account1] = await ethers.getSigners()
      
      const tx = await factory.create(NAME, SYMBOL, account1.address, BASE_URI)
      await tx.wait()

      const { contractAddress, assignedTo } = await fetchCreateEvent(factory, tx)
      
      const reward = new ethers.Contract(
        contractAddress,
        require('../artifacts/contracts/Reward.sol/Reward.json').abi,
        account1
      )

      expect(await reward.owner()).to.equal(assignedTo).and.equal(account1.address)
    })

    it("Should create and set _metadataURI as baseURI param", async function () {
      const {factory} = await deployRewardFactory()
      const [,account1] = await ethers.getSigners()

      const tx = await factory.create(NAME, SYMBOL, account1.address, BASE_URI)
      await tx.wait()

      const { contractAddress } = await fetchCreateEvent(factory, tx)
      
      const reward = new ethers.Contract(
        contractAddress,
        require('../artifacts/contracts/Reward.sol/Reward.json').abi,
        account1
      )

      // Mint and get tokenURI to check base URI
      await reward.connect(account1).mint()
      expect(await reward.tokenURI(1)).to.equal(BASE_URI)
    })

    it("Should revert create if not owner", async function () {
      const {factory} = await deployRewardFactory()
      const [,account1] = await ethers.getSigners()
      await expect(factory.connect(account1).create(NAME, SYMBOL, account1.address, BASE_URI))
        .to.be.revertedWith("Ownable: caller is not the owner")
    })
  })

  describe("Events", function () {
    it("Should create and emit Create event", async function () {
      const [, account1] = await ethers.getSigners()
      const { factory } = await deployRewardFactory()
      await expect(factory.create(NAME, SYMBOL, account1.address, BASE_URI))
        .to.emit(factory, "Create")
    })
  })
})