// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.20;

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
        // Use the private key to start a broadcast
        vm.startBroadcast(vm.envUint("PRIVATE_KEY"));

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
