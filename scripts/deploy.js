import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with account:", deployer.address);

  const MemoryGameFHE = await ethers.getContractFactory("MemoryGameFHE");
  const game = await MemoryGameFHE.deploy();

  await game.deployed();

  console.log("MemoryGameFHE deployed to:", game.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
