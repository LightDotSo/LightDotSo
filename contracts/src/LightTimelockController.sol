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
    // Initializer
    // -------------------------------------------------------------------------

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address lightWallet, address lightProtocolController) public initializer {
        __TimelockController_init(
            MIN_DELAY, _singletonArray(lightWallet), _singletonArray(lightProtocolController), address(0)
        );

        // Register executor role to the light wallet
        _setupRole(EXECUTOR_ROLE, lightWallet);

        // Register canceler role to the light protocol controller
        _setupRole(CANCELLER_ROLE, lightProtocolController);
    }

    // -------------------------------------------------------------------------
    // Utils
    // -------------------------------------------------------------------------

    // Helper function to create a single-element address array
    function _singletonArray(address element) private pure returns (address[] memory) {
        address[] memory array = new address[](1);
        array[0] = element;
        return array;
    }
}
