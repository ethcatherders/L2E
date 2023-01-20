// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const [signer] = await hre.ethers.getSigners()

  console.log("Deploying Reward...")
  const Reward = await hre.ethers.getContractFactory("Reward");
  const reward = await Reward.deploy(signer.address);
  await reward.deployed()

  console.log(
    `Reward deployed to ${reward.address}`,
    `\nOwnership of Reward assigned to ${await reward.owner()}`
  );

  const initLockTx = await reward.initLock();
  await initLockTx.wait();

  console.log(`\nReward contract has been initlocked.\n`)
  console.log("Deploying RewardFactory...")

  const RewardFactory = await hre.ethers.getContractFactory("RewardFactory");
  const factory = await RewardFactory.deploy(reward.address);

  await factory.deployed();

  console.log(
    `RewardFactory deployed to ${factory.address}`,
    `\nImplementation set as Reward address: ${await factory.implementation()}`,
    `\nOwnership of RewardFactory assigned to ${await factory.owner()}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
