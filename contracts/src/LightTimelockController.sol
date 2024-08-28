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

import {TimelockController} from "@openzeppelin/contracts/governance/TimelockController.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {ILightWallet} from "@/contracts/interfaces/ILightWallet.sol";

pragma solidity ^0.8.18;

/// @title LightTimelockController
/// @author @shunkakinoki
/// @notice LightTimelockController is a timelock controller contract for Light Protocol.
/// This is the version 0.1.0 contract for Light Protocol.
/// @dev The contract is the initial implementation of a timelock controller for Light Protocol.
/// @dev Further implementations will be added in the future, and may be subject to change.
contract LightTimelockController is TimelockController {
    // -------------------------------------------------------------------------
    // Constant
    // -------------------------------------------------------------------------

    /// @notice The name for this contract
    string public constant NAME = "LightTimelockController";

    /// @notice The version for this contract
    string public constant VERSION = "0.0.1";

    // -------------------------------------------------------------------------
    // Storage
    // -------------------------------------------------------------------------

    address public immutable proposer;

    bytes32 public constant APPROVER_ROLE = keccak256("APPROVER_ROLE");

    mapping(bytes32 => bool) public executedProposals;

    // -------------------------------------------------------------------------
    // Constructor + Functions
    // -------------------------------------------------------------------------

    constructor(uint256 _minDelay, address _proposer, address _approver)
        TimelockController(_minDelay, new address[](0), new address[](0), address(0))
    {
        proposer = _proposer;

        _setupRole(PROPOSER_ROLE, _proposer);
        _setupRole(APPROVER_ROLE, _approver);

        _setRoleAdmin(PROPOSER_ROLE, PROPOSER_ROLE);
        _setRoleAdmin(APPROVER_ROLE, APPROVER_ROLE);

        _grantRole(TIMELOCK_ADMIN_ROLE, address(this));
        _grantRole(PROPOSER_ROLE, address(this));
        _grantRole(EXECUTOR_ROLE, address(this));
        _grantRole(CANCELLER_ROLE, address(this));
    }

    function proposeAndSchedule(
        bytes32 merkleRoot,
        bytes memory signature,
        bytes32[] calldata merkleProof,
        address target,
        uint256 value,
        bytes calldata data,
        bytes32 predecessor,
        bytes32 salt,
        uint256 delay
    ) public onlyRole(APPROVER_ROLE) {
        // Check the merkle proof
        bytes32 leaf = keccak256(abi.encodePacked(target, value, keccak256(data), predecessor, salt, delay));
        require(MerkleProof.verify(merkleProof, merkleRoot, leaf), "Invalid Merkle proof");

        // Call `isValidSignature` on the proposer to validate the signature
        bytes4 isValidSignature = ILightWallet(proposer).isValidSignature(leaf, signature);
        require(isValidSignature == 0x1626ba7e, "Invalid signature");

        // Check if the proposal is already executed
        bytes32 proposalId = hashOperation(target, value, data, predecessor, salt);
        require(!executedProposals[proposalId], "Proposal already executed");

        // Schedule the proposal
        super.schedule(target, value, data, predecessor, salt, delay);
    }

    function execute(address target, uint256 value, bytes calldata data, bytes32 predecessor, bytes32 salt)
        public
        payable
        virtual
        override
        onlyRole(APPROVER_ROLE)
    {
        // Check if the proposal is already executed
        bytes32 proposalId = hashOperation(target, value, data, predecessor, salt);
        require(!executedProposals[proposalId], "Proposal already executed");

        // Execute the proposal
        executedProposals[proposalId] = true;
        super.execute(target, value, data, predecessor, salt);
    }

    function executeBatch(
        address[] calldata targets,
        uint256[] calldata values,
        bytes[] calldata payloads,
        bytes32 predecessor,
        bytes32 salt
    ) public payable virtual override onlyRole(APPROVER_ROLE) {
        // Check if the proposal is already executed
        bytes32 proposalId = hashOperationBatch(targets, values, payloads, predecessor, salt);
        require(!executedProposals[proposalId], "Proposal already executed");

        // Execute the proposal in batch
        executedProposals[proposalId] = true;
        super.executeBatch(targets, values, payloads, predecessor, salt);
    }
}
