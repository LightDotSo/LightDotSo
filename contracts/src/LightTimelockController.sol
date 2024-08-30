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

pragma solidity ^0.8.18;

import {TimelockController} from "@openzeppelin/contracts/governance/TimelockController.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {ILightWallet} from "@/contracts/interfaces/ILightWallet.sol";

/// @title LightTimelockController
/// @author @shunkakinoki
/// @notice LightTimelockController is a timelock controller contract for Light Protocol.
/// This is the version 0.1.0 contract for Light Protocol.
/// @dev The contract is the initial implementation of a timelock controller for Light Protocol.
/// @dev Further implementations will be added in the future, and may be subject to change.
contract LightTimelockController is TimelockController {
    // -------------------------------------------------------------------------
    // Constants
    // -------------------------------------------------------------------------

    /// @notice The name for this contract
    string public constant NAME = "LightTimelockController";

    /// @notice The version for this contract
    string public constant VERSION = "0.0.1";

    // -------------------------------------------------------------------------
    // Storage
    // -------------------------------------------------------------------------

    address public immutable proposer;

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(uint256 minDelay, address _proposer, address _executor)
        TimelockController(minDelay, new address[](0), new address[](0), address(0))
    {
        proposer = _proposer;

        _setupRole(PROPOSER_ROLE, _proposer);
        _setupRole(EXECUTOR_ROLE, _executor);
        _setupRole(CANCELLER_ROLE, _executor);

        _setRoleAdmin(PROPOSER_ROLE, PROPOSER_ROLE);
        _setRoleAdmin(EXECUTOR_ROLE, EXECUTOR_ROLE);
        _setRoleAdmin(CANCELLER_ROLE, CANCELLER_ROLE);
    }

    // -------------------------------------------------------------------------
    // External Functions
    // -------------------------------------------------------------------------

    function verifyAndSchedule(
        bytes32 merkleRoot,
        bytes memory signature,
        bytes32[] calldata merkleProof,
        address target,
        uint256 value,
        bytes calldata data,
        bytes32 predecessor,
        bytes32 salt,
        uint256 delay
    ) external onlyRole(PROPOSER_ROLE) {
        bytes32 leaf = keccak256(abi.encodePacked(target, value, keccak256(data), predecessor, salt, delay));
        require(MerkleProof.verify(merkleProof, merkleRoot, leaf), "LightTimelockController: Invalid Merkle proof");

        bytes4 isValidSignature = ILightWallet(proposer).isValidSignature(merkleRoot, signature);
        require(isValidSignature == 0x1626ba7e, "LightTimelockController: Invalid signature");

        schedule(target, value, data, predecessor, salt, delay);
    }
}
