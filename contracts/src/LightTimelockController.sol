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
    "@openzeppelin/contracts-upgradeable/governance/TimelockControllerUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/// @title LightTimelockController
/// @author @shunkakinoki
/// @notice LightTimelockController is a timelock controller contract for Light Protocol.
/// This is the version 0.1.0 contract for Light Protocol.
/// @dev The contract is the initial implementation of a timelock controller for Light Protocol.
/// @dev Further implementations will be added in the future, and may be subject to change.
contract LightTimelockController is Initializable, TimelockControllerUpgradeable, UUPSUpgradeable {
    // -------------------------------------------------------------------------
    // Constant
    // -------------------------------------------------------------------------

    /// @notice The name for this contract
    string public constant NAME = "LightTimelockController";

    /// @notice The version for this contract
    string public constant VERSION = "0.1.0";

    // -------------------------------------------------------------------------
    // Immutable
    // -------------------------------------------------------------------------

    /// @notice The minimum delay for the timelock
    uint256 public immutable MIN_DELAY = 300 seconds;

    /// @notice The address of the light protocol controller
    address public immutable LIGHT_PROTOCOL_CONTROLLER = address(0);

    // -------------------------------------------------------------------------
    // Constructor + Functions
    // -------------------------------------------------------------------------

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice Initialize the timelock controller
    /// @param wallet The address of the authorized wallet (proposer and executor)
    /// @dev This function is called by the factory contract
    function initialize(address wallet) public virtual initializer {
        // Initialize the proposers
        address[] memory proposers = new address[](1);
        proposers[0] = wallet;

        // Initialize the executors
        address[] memory executors = new address[](1);
        executors[0] = LIGHT_PROTOCOL_CONTROLLER;

        // Initialize the timelock controller as in `__TimelockController_init_unchained`
        // Proposer `singletonArray(lightWallet)` is the proposer and canceller by default
        // Executor `singletonArray(lightProtocolController)` is the only executor by default
        // Admin `address(0)` is the default admin (set to the timelock controller itself)
        __TimelockController_init(MIN_DELAY, proposers, executors, address(0));

        // Revoke canceller role from the wallet
        _revokeRole(CANCELLER_ROLE, wallet);

        // Register executor role to the light wallet
        _grantRole(EXECUTOR_ROLE, wallet);

        // Register canceler role to the light protocol controller
        _grantRole(CANCELLER_ROLE, LIGHT_PROTOCOL_CONTROLLER);
    }

    // -------------------------------------------------------------------------
    // Upgrades
    // -------------------------------------------------------------------------

    /// @dev Only callable by the admin role (default admin is the timelock controller itself)
    /// @inheritdoc UUPSUpgradeable
    function _authorizeUpgrade(address) internal view override onlyRole(DEFAULT_ADMIN_ROLE) {}
}
