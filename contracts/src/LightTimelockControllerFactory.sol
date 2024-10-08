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

import {Create2} from "@openzeppelin/contracts/utils/Create2.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {LightTimelockController} from "@/contracts/LightTimelockController.sol";

/// @title LightTimelockControllerFactory
/// @author @shunkakinoki
/// @notice A factory contract for `LightTimelockController`
contract LightTimelockControllerFactory {
    // -------------------------------------------------------------------------
    // Constant
    // -------------------------------------------------------------------------

    /// @notice The name for this contract
    string public constant NAME = "LightTimelockControllerFactory";

    /// @notice The version for this contract
    string public constant VERSION = "0.1.0";

    // -------------------------------------------------------------------------
    // Immutable Storage
    // -------------------------------------------------------------------------

    /// @notice The implementation contract for `LightTimelockController`
    LightTimelockController public immutable timelockImplementation;

    // -------------------------------------------------------------------------
    // Errors
    // -------------------------------------------------------------------------

    /// @notice The wallet address is zero
    error WalletAddressZero();

    // -------------------------------------------------------------------------

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
    /// @param wallet The address of the authorized wallet (proposer and executor).
    /// @param salt The salt for the CREATE2 deployment.
    function createTimelockController(
        address wallet,
        bytes32 salt
    )
        public
        returns (LightTimelockController ret)
    {
        if (wallet == address(0)) revert WalletAddressZero();

        address addr = getAddress(wallet, salt);
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
                        abi.encodeCall(LightTimelockController.initialize, (wallet))
                    )
                )
            )
        );
    }

    /// @notice Calculate the counterfactual address of the timelock controller as it would be
    /// returned by createTimelockController()
    /// @param wallet The address of the authorized wallet (proposer and executor).
    /// @param salt The salt for the CREATE2 deployment.
    function getAddress(address wallet, bytes32 salt) public view returns (address) {
        return Create2.computeAddress(
            salt,
            keccak256(
                abi.encodePacked(
                    type(ERC1967Proxy).creationCode,
                    abi.encode(
                        address(timelockImplementation),
                        abi.encodeCall(LightTimelockController.initialize, (wallet))
                    )
                )
            )
        );
    }
}
