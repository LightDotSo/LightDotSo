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

pragma solidity ^0.8.27;

import {TimelockControllerUpgradeable} from
    "@openzeppelin/contracts-upgradeable-v4.9/governance/TimelockControllerUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable-v4.9/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable-v4.9/proxy/utils/UUPSUpgradeable.sol";
import {ModuleSelfAuth} from "@0xsequence/wallet-contracts/contracts/modules/commons/ModuleSelfAuth.sol";
import {MerkleProof} from "@openzeppelin/contracts-v4.9/utils/cryptography/MerkleProof.sol";
import {ILightWallet} from "@/contracts/interfaces/ILightWallet.sol";

/// @title LightTimelockController
/// @author @shunkakinoki
/// @notice LightTimelockController is a timelock controller contract for Light Protocol.
/// This is the version 0.1.0 contract for Light Protocol.
/// @dev The contract is the initial implementation of a timelock controller for Light Protocol.
/// @dev Further implementations will be added in the future, and may be subject to change.
contract LightTimelockController is ModuleSelfAuth, Initializable, TimelockControllerUpgradeable, UUPSUpgradeable {
    // -------------------------------------------------------------------------
    // Constants
    // -------------------------------------------------------------------------

    /// @notice The name for this contract
    string public constant NAME = "LightTimelockController";

    /// @notice The version for this contract
    string public constant VERSION = "0.1.0";

    /// @notice The minimum delay for the timelock
    uint256 public immutable MIN_DELAY = 300 seconds;

    // -------------------------------------------------------------------------
    // Constructor + Functions
    // -------------------------------------------------------------------------

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice Initialize the timelock controller
    /// @param lightWallet The address of the light wallet (proposer and executor)
    /// @param lightProtocolController The address of the light protocol controller (executor and canceler)
    /// @dev This function is called by the factory contract
    function initialize(address lightWallet, address lightProtocolController) public virtual initializer {
        // Initialize the proposers
        address[] memory proposers = new address[](1);
        proposers[0] = lightWallet;

        // Initialize the executors
        address[] memory executors = new address[](1);
        executors[0] = lightProtocolController;

        // Initialize the timelock controller as in `__TimelockController_init_unchained`
        // Proposer `singletonArray(lightWallet)` is the proposer and canceller by default
        // Executor `singletonArray(lightProtocolController)` is the only executor by default
        // Admin `address(0)` is the default admin (set to the timelock controller itself)
        __TimelockController_init(MIN_DELAY, proposers, executors, address(0));

        // Revoke canceller role from the light wallet
        _revokeRole(CANCELLER_ROLE, lightWallet);

        // Register executor role to the light wallet
        _setupRole(EXECUTOR_ROLE, lightWallet);

        // Register canceler role to the light protocol controller
        _setupRole(CANCELLER_ROLE, lightProtocolController);
    }

    // -------------------------------------------------------------------------
    // Upgrades
    // -------------------------------------------------------------------------

    /// @dev Only callable by the current contract
    /// @inheritdoc UUPSUpgradeable
    function _authorizeUpgrade(address) internal view override onlySelf {}
}
