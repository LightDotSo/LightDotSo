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

pragma solidity ^0.8.18;

import {EntryPoint} from "@/contracts/core/EntryPoint.sol";
import {LightVerifyingPaymaster} from "@/contracts/LightVerifyingPaymaster.sol";
import {BaseLightDeployer} from "@/script/base/BaseLightDeployer.s.sol";
// solhint-disable-next-line no-console
import {console} from "forge-std/console.sol";
import {Script} from "forge-std/Script.sol";

// LightVerifyingPaymasterDeployer -- Deploys the LightVerifyingPaymaster contract
contract LightVerifyingPaymasterDeployer is BaseLightDeployer, Script {
    // -------------------------------------------------------------------------
    // Bytecode
    // -------------------------------------------------------------------------

    bytes private byteCode = type(LightVerifyingPaymaster).creationCode;
    bytes private initCode =
        abi.encodePacked(byteCode, abi.encode(address(ENTRY_POINT_ADDRESS), OFFCHAIN_VERIFIER_ADDRESS));

    // -------------------------------------------------------------------------
    // Run
    // -------------------------------------------------------------------------

    function run() public {
        // Log the byte code hash
        // solhint-disable-next-line no-console
        console.logBytes32(keccak256(initCode));

        // The init code hash of the LightVerifyingPaymaster
        // v1: bytes32 initCodeHash = 0xb5e9d23a8d8ca943a255b36822b7927b53c12abb407bbb13b4313f3f494500b8;
        // v2: bytes32 initCodeHash = 0x31a8cb463ff0f1b17f97a5b665b7b1e26f4965cad0b31d74928c4f199f94d9f7;
        // v3: bytes32 initCodeHash = 0x1a282ec216faac041ea20ee36c60483751e315a39e82c8e1f1b7a4499d0feef0;
        bytes32 initCodeHash = 0x31a8cb463ff0f1b17f97a5b665b7b1e26f4965cad0b31d74928c4f199f94d9f7;

        // Assert that the init code is the expected value
        assert(keccak256(initCode) == initCodeHash);

        // Salt for deterministic deployment
        // v1: bytes32 salt = 0x000000000000000000000000000000000000000003cf3a59741da01f6ddc5ce6;
        // v2: bytes32 salt = 0x0000000000000000000000000000000000000000e518dc21f381b8e76fbe1a45;
        // v3: bytes32 salt = 0x00000000000000000000000000000000000000008ba535c09402160e9dccddef;
        bytes32 salt = 0x0000000000000000000000000000000000000000e518dc21f381b8e76fbe1a45;

        // If testing on a local chain, use without a safe create2
        if (block.chainid == 0x7a69) {
            // Use private key
            vm.startBroadcast(vm.envUint("PRIVATE_KEY"));

            // Construct the entrypoint
            entryPoint = new EntryPoint();

            // Create the paymaster
            paymaster = new LightVerifyingPaymaster(entryPoint, address(0x0));
        } else {
            // Use regular broadcast
            vm.startBroadcast();

            // Create LightVerifyingPaymaster
            paymaster = LightVerifyingPaymaster(IMMUTABLE_CREATE2_FACTORY.safeCreate2(salt, initCode));

            // Assert that the paymaster is the expected address
            assert(address(paymaster) == LIGHT_PAYMASTER_ADDRESS);
        }

        // Stop the broadcast
        vm.stopBroadcast();
    }
}
