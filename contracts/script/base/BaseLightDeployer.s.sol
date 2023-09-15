// Copyright (C) 2023 Light, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

// SPDX-License-Identifier: AGPL-3.0-or-later

import {EntryPoint} from "@/contracts/core/EntryPoint.sol";
import {LightWallet} from "@/contracts/LightWallet.sol";
import {LightWalletFactory} from "@/contracts/LightWalletFactory.sol";
import {LightVerifyingPaymaster} from "@/contracts/LightVerifyingPaymaster.sol";
import {LightWalletUtils} from "@/test/utils/LightWalletUtils.sol";
// solhint-disable-next-line no-console
import {console} from "forge-std/console.sol";

pragma solidity ^0.8.18;

interface ImmutableCreate2Factory {
    function safeCreate2(bytes32 salt, bytes calldata initializationCode)
        external
        payable
        returns (address deploymentAddress);
}

// BaseLightDeployer - Create abstract contract of just immutable storages
abstract contract BaseLightDeployer {
    // -------------------------------------------------------------------------
    // Storages
    // -------------------------------------------------------------------------

    EntryPoint internal entryPoint;

    LightWallet internal wallet;

    LightWalletFactory internal factory;

    LightVerifyingPaymaster internal paymaster;

    LightWalletUtils internal lightWalletUtils;

    bytes32 internal expectedImageHash;

    // -------------------------------------------------------------------------
    // Immutable Storage
    // -------------------------------------------------------------------------

    address internal constant LIGHT_FACTORY_ADDRESS = address(0x0000000000756D3E6464f5efe7e413a0Af1C7474);

    address internal constant LIGHT_PAYMASTER_ADDRESS = address(0x0000000000756D3E6464f5efe7e413a0Af1C7474);

    address internal constant OFFCHAIN_VERIFIER_ADDRESS = address(0x514a099c7eC404adF25e3b6b6A3523Ac3A4A778F);

    address internal constant PRIVATE_KEY_DEPLOYER = address(0x81a2500fa1ae8eB96a63D7E8b6b26e6cabD2C9c0);

    address internal constant ENTRY_POINT_ADDRESS = address(0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789);

    // -------------------------------------------------------------------------
    // Immutable Factoy
    // -------------------------------------------------------------------------

    address internal constant IMMUTABLE_CREATE2_FACTORY_ADDRESS = 0x0000000000FFe8B47B3e2130213B802212439497;
    ImmutableCreate2Factory internal constant IMMUTABLE_CREATE2_FACTORY =
        ImmutableCreate2Factory(IMMUTABLE_CREATE2_FACTORY_ADDRESS);

    // -------------------------------------------------------------------------
    // Setup
    // -------------------------------------------------------------------------

    /// @dev BaseTest setup
    function setUp() public virtual {
        // Get the entry point
        entryPoint = EntryPoint(payable(ENTRY_POINT_ADDRESS));

        // Construct the utils
        lightWalletUtils = new LightWalletUtils();
    }

    // -------------------------------------------------------------------------
    // Utilities
    // -------------------------------------------------------------------------

    function randMod() internal view returns (bytes32) {
        return bytes32(uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao))) % 4337);
    }
}
