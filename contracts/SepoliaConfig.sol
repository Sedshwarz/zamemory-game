// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./ZamaOracleAddress.sol";

abstract contract SepoliaConfig {
    address public constant ORACLE = ZamaOracleAddress.ORACLE;
}