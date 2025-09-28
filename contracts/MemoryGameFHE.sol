// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract MemoryGameFHE is SepoliaConfig {
  mapping(address => euint32) private bestEncrypted;

  function submitScore(externalEuint32 inputHandle, bytes calldata inputProof) external {
    euint32 incoming = FHE.fromExternal(inputHandle, inputProof);

    euint32 current = bestEncrypted[msg.sender];

    euint32 zero = FHE.asEuint32(0);

    ebool isZero = FHE.eq(current, zero);

    ebool cmp = FHE.lt(incoming, current);

    euint32 chosenWhenNotZero = FHE.select(cmp, incoming, current);
    euint32 newBest = FHE.select(isZero, incoming, chosenWhenNotZero);

    bestEncrypted[msg.sender] = newBest;

    FHE.allow(bestEncrypted[msg.sender], msg.sender);
  }

  function getMyBest() external view returns (euint32) {
    return bestEncrypted[msg.sender];
  }

  function getEncryptedBest(address player) external view returns (euint32) {
    return bestEncrypted[player];
  }
}
