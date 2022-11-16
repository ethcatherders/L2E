const { ethers } = require("hardhat");

const NAME = "Learn2Earn Reward"
const SYMBOL = "L2E"
const BASE_URI = "ipfs://<CID>"

module.exports = {
  NAME,
  SYMBOL,
  BASE_URI,
  deployReward: async function(accountIndex) {
    const accounts = await ethers.getSigners()
    const Reward = await ethers.getContractFactory("Reward")
    const reward = await Reward.deploy(accounts[accountIndex].address)
    await reward.deployed()
    return { reward, accounts }
  },
  deployRewardFactory: async function(accountIndex) {
    // const [owner, otherAccount] = await ethers.getSigners()
    const { reward, accounts } = await module.exports.deployReward(accountIndex)
    const RewardFactory = await ethers.getContractFactory("RewardFactory")
    const factory = await RewardFactory.deploy(reward.address)
    await factory.deployed()
    return { factory, reward, accounts }
  },
  fetchCreateEvent: async function(contract, tx) {
    const createEvent = contract.filters.CreateReward()
    const eventArray = await contract.queryFilter(createEvent, tx.blockHash)
    const eventIndex = eventArray.length ? eventArray.length - 1 : 0
    const parsedEvent = { event: eventArray[eventIndex].event, args: eventArray[eventIndex].args }
    return { ...parsedEvent.args }
  }
}
