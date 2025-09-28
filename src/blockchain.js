import { ethers } from "ethers";
import MemoryGameAbi from "./artifacts/contracts/MemoryGame.sol/MemoryGameFHE.json";
import { CONTRACT_ADDRESS } from "./config.js";

let provider;
let signer;
let contract;

export async function connectWallet() {
  if (!window.ethereum) throw new Error("No Metamask");
  await window.ethereum.request({ method: "eth_requestAccounts" });
  provider = new ethers.providers.Web3Provider(window.ethereum);
  signer = provider.getSigner();
  contract = new ethers.Contract(CONTRACT_ADDRESS, MemoryGameAbi.abi, signer);
  return { address: await signer.getAddress() };
}

export async function readBestScore(address) {
  if (!contract) throw new Error("Contract not connected");
  const score = await contract.getBestScore(address);
  return score.toNumber();
}

export async function submitScore(score) {
  if (!contract) throw new Error("Contract not connected");
  const tx = await contract.submitScore(score);
  const receipt = await tx.wait();
  return receipt;
}
