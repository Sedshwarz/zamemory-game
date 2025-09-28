import { ethers } from "ethers";
import MemoryGameAbi from "../abi/MemoryGameFHE.json";
import { CONTRACT_ADDRESS } from "../config.js";

export const getContract = async () => {
  if (!window.ethereum) {
    throw new Error("No Metamask!");
  }

  await window.ethereum.request({ method: "eth_requestAccounts" });

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  return new ethers.Contract(CONTRACT_ADDRESS, MemoryGameAbi.abi, signer);
};

