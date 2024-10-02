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

import {AsyncVault} from "asynchronous-vault-patch/AsyncVault.sol";
import {IERC20} from "asynchronous-vault-patch/SyncVault.sol";
import {Create2} from "@openzeppelin/contracts/utils/Create2.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {LightVault} from "@/contracts/LightVault.sol";

/// @title LightVaultFactory
/// @author @shunkakinoki
/// @notice A factory contract for `LightVault`
contract LightVaultFactory {
    // -------------------------------------------------------------------------
    // Constant
    // -------------------------------------------------------------------------

    /// @notice The name for this contract
    string public constant NAME = "LightVaultFactory";

    /// @notice The version for this contract
    string public constant VERSION = "0.1.0";

    // -------------------------------------------------------------------------
    // Immutable Storage
    // -------------------------------------------------------------------------

    /// @notice The implementation contract for `LightVault`
    LightVault public immutable vaultImplementation;

    /// @notice The fees for the Light Protocol
    uint16 public immutable LIGHT_PROTOCOL_FEES = 3;

    /// @notice The owner of the Light Protocol
    address public immutable LIGHT_PROTOCOL_OWNER = address(0);

    /// @notice The treasury of the Light Protocol
    address public immutable LIGHT_PROTOCOL_TREASURY = address(0);

    // -------------------------------------------------------------------------
    // Errors
    // -------------------------------------------------------------------------

    error TokenAddressZero();

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor() {
        vaultImplementation = new LightVault();
    }

    // -------------------------------------------------------------------------
    // External Functions
    // -------------------------------------------------------------------------

    /// @notice Creates a LightVault, and return its address.
    /// @param underlying The underlying token of the vault.
    /// @param bootstrapAmount The bootstrap amount for the vault.
    /// @param name The name of the vault token.
    /// @param symbol The symbol of the vault token.
    function createVault(
        address underlying,
        uint256 bootstrapAmount,
        string memory name,
        string memory symbol
    )
        public
        returns (LightVault ret)
    {
        if (underlying == address(0)) revert TokenAddressZero();

        bytes memory initializeData = abi.encodeCall(
            AsyncVault.initialize,
            (
                LIGHT_PROTOCOL_FEES,
                LIGHT_PROTOCOL_OWNER,
                LIGHT_PROTOCOL_TREASURY,
                IERC20(underlying),
                bootstrapAmount,
                name,
                symbol
            )
        );
        bytes memory proxyBytecode = abi.encodePacked(
            type(ERC1967Proxy).creationCode,
            abi.encode(address(vaultImplementation), initializeData)
        );
        bytes32 salt = bytes32(uint256(uint160(address(underlying))));

        address proxyAddress = Create2.deploy(0, salt, proxyBytecode);
        ret = LightVault(payable(proxyAddress));
    }

    /// @notice Calculate the counterfactual address of the vault as it would be returned by
    /// createVault()
    /// @param underlying The underlying token of the vault.
    function getAddress(
        IERC20 underlying,
        uint256 bootstrapAmount,
        string memory name,
        string memory symbol
    )
        public
        view
        returns (address)
    {
        bytes memory initializeData = abi.encodeCall(
            AsyncVault.initialize,
            (
                LIGHT_PROTOCOL_FEES,
                LIGHT_PROTOCOL_OWNER,
                LIGHT_PROTOCOL_TREASURY,
                underlying,
                bootstrapAmount,
                name,
                symbol
            )
        );
        return Create2.computeAddress(
            bytes32(uint256(uint160(address(underlying)))),
            keccak256(
                abi.encodePacked(
                    type(ERC1967Proxy).creationCode,
                    abi.encode(address(vaultImplementation), initializeData)
                )
            )
        );
    }
}
