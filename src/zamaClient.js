import { Buffer } from "buffer";
import { initSDK, createInstance, SepoliaConfig } from "@zama-fhe/relayer-sdk/web";
window.Buffer = Buffer;


let relayer = null;

export async function initRelayer() {
  if (relayer) return relayer;

  await initSDK();
  relayer = await createInstance({
    ...SepoliaConfig,
    relayerUrl: "/relayer",
    network: window.ethereum
  });;

  return relayer;
}

export async function createEncryptedScore(finalTimeMs, contractAddress, signerAddress) {
  const relayer = await initRelayer();

  const input = relayer.createEncryptedInput(contractAddress, signerAddress);
  input.add32(Math.floor(finalTimeMs / 100));

  const encryptedInputs = await input.encrypt();

  return {
    handle: encryptedInputs.handles[0],
    proof: encryptedInputs.inputProof,
  };
}

export async function decryptEncryptedEuint(resultCiphertext, contractAddress, signer) {
  const relayer = await initRelayer();

  const clear = await relayer.userDecryptEuint32(
    resultCiphertext,
    contractAddress,
    signer
  );
  return Number(clear);
}
