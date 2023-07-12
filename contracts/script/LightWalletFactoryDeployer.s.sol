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

import {LightWalletFactory} from "@/contracts/LightWalletFactory.sol";
import "forge-std/Script.sol";

interface ImmutableCreate2Factory {
    function safeCreate2(bytes32 salt, bytes calldata initializationCode)
        external
        payable
        returns (address deploymentAddress);
}

contract SeaportDeployer is Script {
    address private constant EXPECTED_LIGHT_FACTORY_ADDRESS = address(0);
    address private constant IMMUTABLE_CREATE2_FACTORY_ADDRESS = 0x0000000000FFe8B47B3e2130213B802212439497;
    ImmutableCreate2Factory private constant IMMUTABLE_CREATE2_FACTORY =
        ImmutableCreate2Factory(IMMUTABLE_CREATE2_FACTORY_ADDRESS);

    function run() public {
        // Start the broadcast
        vm.startBroadcast();

        // TODO: Specify salt for deterministic deployment
        bytes32 salt = 0x0;

        // Create LightWalletFactory
        IMMUTABLE_CREATE2_FACTORY.safeCreate2(salt, type(LightWalletFactory).creationCode);
        // address factory = IMMUTABLE_CREATE2_FACTORY.safeCreate2(salt, type(LightWalletFactory).creationCode);

        // Assert that the factory is the expected address
        // TODO: Add this assertion back in once we have a deterministic deployment
        // assert(factory, EXPECTED_LIGHT_FACTORY_ADDRESS);

        // Stop the broadcast
        vm.stopBroadcast();
    }
}
