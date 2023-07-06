// SPDX-License-Identifier: GPL-3.0

// Interface for IERC1271
// From: https://eips.ethereum.org/EIPS/eip-1271
// License: CC-BY-SA-4.0

pragma solidity ^0.8.18;

interface IERC1271 {
    // -------------------------------------------------------------------------
    // Actions
    // -------------------------------------------------------------------------

    function isValidSignature(bytes32 hash, bytes calldata signature) external view returns (bytes4 magicValue);
}
