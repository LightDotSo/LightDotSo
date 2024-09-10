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

import {TimelockControllerUpgradeable} from
    "@openzeppelin/contracts-upgradeable/governance/TimelockControllerUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {ILightWallet} from "@/contracts/interfaces/ILightWallet.sol";

/// @title LightTimelockController
/// @author @shunkakinoki
/// @notice LightTimelockController is a timelock controller contract for Light Protocol.
/// This is the version 0.1.0 contract for Light Protocol.
/// @dev The contract is the initial implementation of a timelock controller for Light Protocol.
/// @dev Further implementations will be added in the future, and may be subject to change.
contract LightTimelockController is Initializable, TimelockControllerUpgradeable {
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
    /// @param lightWallet The address of the light wallet
    /// @param lightProtocolController The address of the light protocol controller
    /// @dev This function is called by the factory contract
    /// @dev Modified from `__TimelockController_init_unchained` in TimelockControllerUpgradeable.sol
    function initialize(address lightWallet, address lightProtocolController) public virtual initializer {
        // Set the role admin for the timelock controller
        // From: https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/f55babcbeef1d1c42c8e0f8884abcd6663a7909f/contracts/governance/TimelockControllerUpgradeable.sol#L87-90
        // License: MIT
        _setRoleAdmin(TIMELOCK_ADMIN_ROLE, TIMELOCK_ADMIN_ROLE);
        _setRoleAdmin(PROPOSER_ROLE, TIMELOCK_ADMIN_ROLE);
        _setRoleAdmin(EXECUTOR_ROLE, TIMELOCK_ADMIN_ROLE);
        _setRoleAdmin(CANCELLER_ROLE, TIMELOCK_ADMIN_ROLE);

        // self administration
        // From: https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/f55babcbeef1d1c42c8e0f8884abcd6663a7909f/contracts/governance/TimelockControllerUpgradeable.sol#L92-93
        // License: MIT
        _setupRole(TIMELOCK_ADMIN_ROLE, address(this));

        // Register executor and proposer role to the light wallet
        _setupRole(EXECUTOR_ROLE, lightWallet);
        _setupRole(PROPOSER_ROLE, lightWallet);

        // Register canceler role to the light protocol controller
        _setupRole(CANCELLER_ROLE, lightProtocolController);
        _setupRole(EXECUTOR_ROLE, lightProtocolController);

        // Set the minimum delay for the timelock
        // From: https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/f55babcbeef1d1c42c8e0f8884abcd6663a7909f/contracts/governance/TimelockControllerUpgradeable.sol#L111-112
        // License: MIT
        _minDelay = minDelay;
        emit MinDelayChange(0, minDelay);
    }
}
