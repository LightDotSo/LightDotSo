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

import {MagicSpend} from "magic-spend/MagicSpend.sol";
import {byteCode} from "@/bytecodes/ERC1967Proxy/v0.3.0.b.sol";
import {initCode, initCodeHash, salt, proxySalt} from "@/bytecodes/LightPaymaster/v0.1.0.b.sol";
import {LIGHT_PAYMASTER_ADDRESS, LIGHT_PAYMASTER_IMPLEMENTATION_ADDRESS} from "@/constants/address.sol";
import {EntryPoint} from "@/contracts/core/EntryPoint.sol";
import {LightPaymaster} from "@/contracts/LightPaymaster.sol";
import {BaseLightDeployer} from "@/script/base/BaseLightDeployer.s.sol";
// solhint-disable-next-line no-console
import {console} from "forge-std/console.sol";
import {Script} from "forge-std/Script.sol";

// LightPaymasterDeployer -- Deploys the LightPaymaster contract
contract LightPaymasterDeployer is BaseLightDeployer, Script {
    // -------------------------------------------------------------------------
    // Run
    // -------------------------------------------------------------------------

    function run() public {
        // Log the byte code hash
        // solhint-disable-next-line no-console
        console.logBytes32(keccak256(initCode));

        // Assert that the init code is the expected value
        assert(keccak256(initCode) == initCodeHash);

        // If testing on a local chain, use without a safe create2
        if (block.chainid == 0x7a69) {
            // Use private key
            vm.startBroadcast(vm.envUint("PRIVATE_KEY"));

            // Construct the entrypoint
            entryPoint = deployEntryPoint();

            // Create the paymaster
            paymaster = new LightPaymaster(address(entryPoint));
        } else {
            // Use regular broadcast
            vm.startBroadcast();

            // Deploy the implementation
            LightPaymaster paymasterImplementation = new LightPaymaster(deployWithCreate2(initCode, salt));

            // Assert that the paymaster is the expected address
            assert(address(paymasterImplementation) == LIGHT_PAYMASTER_IMPLEMENTATION_ADDRESS);

            // Deploy the paymaster
            bytes memory proxyInitCode = abi.encodePacked(
                byteCode,
                abi.encode(
                    address(paymasterImplementation),
                    abi.encodeCall(MagicSpend.initialize, (address(0), 100, address(0)))
                )
            );

            // Deploy the proxy
            paymaster = LightPaymaster(payable(deployWithCreate2(proxyInitCode, proxySalt)));

            // Assert that the paymaster is the expected address
            assert(address(paymaster) == LIGHT_PAYMASTER_ADDRESS);
        }

        // Stop the broadcast
        vm.stopBroadcast();
    }
}
