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

import {Create2} from "@openzeppelin/contracts/utils/Create2.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {LightTimelockController} from "@/contracts/LightTimelockController.sol";

/// @title LightTimelockControllerFactory
/// @author @shunkakinoki
/// @notice A factory contract for `LightTimelockController`
contract LightTimelockControllerFactory {
    // -------------------------------------------------------------------------
    // Constants
    // -------------------------------------------------------------------------

    /// @notice The name for this contract
    string public constant NAME = "LightTimelockControllerFactory";

    /// @notice The version for this contract
    string public constant VERSION = "0.1.0";

    // -------------------------------------------------------------------------
    // Immutable Storage
    // -------------------------------------------------------------------------

    LightTimelockController public immutable timelockImplementation;

    // -------------------------------------------------------------------------
    // Errors
    // -------------------------------------------------------------------------

    error LightWalletAddressZero();
    error LightProtocolControllerAddressZero();

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor() {
        timelockImplementation = new LightTimelockController();
    }

    // -------------------------------------------------------------------------
    // External Functions
    // -------------------------------------------------------------------------

    /// @notice Creates a LightTimelockController, and return its address.
    /// @param lightWallet The address of the LightWallet.
    /// @param lightProtocolController The address of the LightProtocolController.
    /// @param salt The salt for the CREATE2 deployment.
    function createTimelockController(address lightWallet, address lightProtocolController, bytes32 salt)
        public
        returns (LightTimelockController ret)
    {
        if (lightWallet == address(0)) revert LightWalletAddressZero();
        if (lightProtocolController == address(0)) revert LightProtocolControllerAddressZero();

        address addr = getAddress(lightWallet, lightProtocolController, salt);
        uint256 codeSize = addr.code.length;
        // If the timelock controller already exists, return it
        if (codeSize > 0) {
            return LightTimelockController(payable(addr));
        }
        // Deploy and initialize the timelock controller
        ret = LightTimelockController(
            payable(
                address(
                    new ERC1967Proxy{salt: salt}(
                        address(timelockImplementation),
                        abi.encodeCall(LightTimelockController.initialize, (lightWallet, lightProtocolController))
                    )
                )
            )
        );
    }

    /// @notice Calculate the counterfactual address of the timelock controller as it would be returned by createTimelockController()
    /// @param lightWallet The address of the LightWallet.
    /// @param lightProtocolController The address of the LightProtocolController.
    /// @param salt The salt for the CREATE2 deployment.
    function getAddress(address lightWallet, address lightProtocolController, bytes32 salt)
        public
        view
        returns (address)
    {
        return Create2.computeAddress(
            salt,
            keccak256(
                abi.encodePacked(
                    type(ERC1967Proxy).creationCode,
                    abi.encode(
                        address(timelockImplementation),
                        abi.encodeCall(LightTimelockController.initialize, (lightWallet, lightProtocolController))
                    )
                )
            )
        );
    }
}
