// Copyright 2023-2024 LightDotSo.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// SPDX-License-Identifier: Apache-2.0

// Interface for IERC1271
// From: https://eips.ethereum.org/EIPS/eip-1271
// License: CC-BY-SA-4.0

pragma solidity ^0.8.27;

import {IEntryPoint} from "@eth-infinitism/account-abstraction/contracts/interfaces/IEntryPoint.sol";
import {IERC1271} from "@/contracts/interfaces/IERC1271.sol";

interface ILightWallet is IERC1271 {
    // -------------------------------------------------------------------------
    // Errors
    // -------------------------------------------------------------------------

    error InvalidMerkleProof(bytes32 root, bytes32 leaf);

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    event LightWalletInitialized(IEntryPoint indexed entryPoint, bytes32 indexed hash);

    // -------------------------------------------------------------------------
    // Actions
    // -------------------------------------------------------------------------

    /// @notice Executes a transaction (called directly by entryPoint).
    function execute(address dest, uint256 value, bytes calldata func) external;

    /// @notice Executes a sequence of transactions (called directly by entryPoint).
    function executeBatch(address[] calldata dest, uint256[] calldata value, bytes[] calldata func) external;

    /// @notice Check if a signature is valid based on the owner's address.
    /// Compatible with ERC1271
    function isValidSignature(bytes32 hash, bytes calldata signatures) external view returns (bytes4);

    /// @notice Compatibility with ERC165
    function supportsInterface(bytes4 interfaceId) external pure returns (bool);

    /// @notice Sets the hash of this account, and emits an event.
    function initialize(bytes32 imageHash) external;

    /// @notice Returns the entry point contract address for this account.
    function entryPoint() external view returns (IEntryPoint);
}
