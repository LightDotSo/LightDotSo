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
import {LightWallet} from "@/contracts/LightWallet.sol";
import {LightWalletFactory} from "@/contracts/LightWalletFactory.sol";
import {UserOperation} from "@/contracts/LightWallet.sol";
import {BaseLightDeployer} from "@/script/base/BaseLightDeployer.s.sol";
import {SimpleAccount} from "@/contracts/samples/SimpleAccount.sol";
import {SimpleAccountFactory} from "@/contracts/samples/SimpleAccountFactory.sol";
import {LightWalletUtils} from "@/test/utils/LightWalletUtils.sol";
import {ERC4337Utils} from "@/test/utils/ERC4337Utils.sol";
import {Script} from "forge-std/Script.sol";
import {Test} from "forge-std/Test.sol";
// solhint-disable-next-line no-console
import {console} from "forge-std/console.sol";

using ERC4337Utils for EntryPoint;

/// @notice Base deployer test for scripts
abstract contract BaseLightDeployerFlow is BaseLightDeployer, Script {
    // -------------------------------------------------------------------------
    // Storages
    // -------------------------------------------------------------------------

    // Address of the owner of the account
    address internal user;
    // Private key of the owner of the account
    uint256 internal userKey;
    // Address of the beneficiary of the account
    address payable internal beneficiary;

    // -------------------------------------------------------------------------
    // Setup
    // -------------------------------------------------------------------------

    /// @dev BaseLightDeployerFlow setup
    function setUp() public virtual override {
        // setUp from BaseLightDeployer
        BaseLightDeployer.setUp();

        // Specify the entryPoint
        entryPoint = EntryPoint(payable(address(ENTRY_POINT_ADDRESS)));

        // LightWalletFactory core contract
        factory = LightWalletFactory(LIGHT_FACTORY_ADDRESS);

        // SimpleAccountFactory core contract
        simpleAccountFactory = SimpleAccountFactory(SIMPLE_ACCOUNT_FACTORY_ADDRESS);

        // Get network name
        string memory defaultName = "mainnet";
        string memory name = vm.envOr("NETWORK_NAME", defaultName);

        // Fork network setup
        vm.createSelectFork(name);
    }

    /// @dev Construct the user operation
    function constructUserOperation(
        address expectedAddress,
        uint256 nonce,
        bytes memory initCode,
        bytes memory callData
    ) internal returns (UserOperation memory op) {
        // Get the paymaster request gas and paymaster and data
        (
            uint256 preVerificationGas,
            uint256 verificationGasLimit,
            uint256 callGasLimit,
            bytes memory paymasterAndData,
            uint256 maxFeePerGas,
            uint256 maxPriorityFeePerGas
        ) = getPaymasterRequestGasAndPaymasterAndData(expectedAddress, nonce, initCode, callData);

        // Get the gas estimation
        // (uint256 preVerificationGas, uint256 verificationGasLimit, uint256 callGasLimit) =
        // getEthEstimateUserOperationGas(expectedAddress, initCode);

        // UserOperation to create the account
        op = UserOperation(
            expectedAddress,
            nonce,
            initCode,
            callData,
            callGasLimit,
            // 1_000_000,
            verificationGasLimit,
            // 1_000_000,
            preVerificationGas,
            // 500_000,
            maxFeePerGas,
            maxPriorityFeePerGas,
            paymasterAndData,
            // signature should be empty
            ""
        );
    }

    /// @dev Handle the ops with the entryPoint
    function handleOps(UserOperation memory op) internal {
        // Construct the ops
        UserOperation[] memory ops = new UserOperation[](1);
        ops[0] = op;

        // Handle the ops
        entryPoint.handleOps(ops, payable(address(1)));
    }

    /// @dev Simulate the ops with the entryPoint
    function simulateValidation(UserOperation memory op) internal {
        // Simulate the UserOperation
        entryPoint.simulateValidation(op);
    }

    /// @dev Deploy the SimpleAccount contract
    function deploySimpleAccount() internal {
        // Set the nonce
        uint256 nonce = randomNonce();

        // Set the user and userKey
        (address deployer, uint256 deployerKey) = makeAddrAndKey("user");

        // Set the initCode to create an account with the expected image hash and random nonce
        bytes memory initCode = abi.encodePacked(
            SIMPLE_ACCOUNT_FACTORY_ADDRESS,
            abi.encodeWithSelector(SimpleAccountFactory.createAccount.selector, deployer, nonce)
        );

        // Get the expected address
        address expectedAddress = simpleAccountFactory.getAddress(deployer, nonce);

        // Sent ETH to the account w/ the expected address
        // bytes memory callData = abi.encodeWithSelector(LightWallet.execute.selector, address(1), 1, bytes(""));
        bytes memory callData = "";

        // UserOperation to create the account
        UserOperation memory op = constructUserOperation(expectedAddress, 0, initCode, callData);

        // -------------------------------------------------------------------------

        // Empty the paymasterAndData
        // op.paymasterAndData = "";

        // -------------------------------------------------------------------------

        // Sign the UserOperation
        bytes memory sig = entryPoint.signUserOp(vm, deployerKey, op);

        // Construct the UserOperation
        op.signature = sig;

        // Simulate the validation
        // try simulateValidation(op) {} catch {}

        // Handle the validation
        handleOps(op);

        // Handle the ops
        sendUserOperation(op);
    }

    /// @dev Deploy the LightWallet contract
    function deployLightWallet() internal returns (LightWallet) {
        // Set the user and userKey
        (address deployer, uint256 deployerKey) = makeAddrAndKey("user");

        // Get the expected image hash
        expectedImageHash = LightWalletUtils.getExpectedImageHash(deployer, weight, threshold, checkpoint);

        // Get the expected address
        address expectedAddress = factory.getAddress(expectedImageHash, nonce);

        // Deposit ETH into the account for stake deposit
        // address(expectedAddress).call{value: 1002500000000}("");

        // Set the initCode to create an account with the expected image hash and random nonce
        bytes memory initCode = abi.encodePacked(
            LIGHT_FACTORY_ADDRESS,
            abi.encodeWithSelector(LightWalletFactory.createAccount.selector, expectedImageHash, nonce)
        );

        // solhint-disable-next-line no-console
        console.logBytes(initCode);

        // Sent ETH to the account w/ the expected address
        // bytes memory callData = abi.encodeWithSelector(LightWallet.execute.selector, address(1), 1, bytes(""));
        bytes memory callData = "";

        // UserOperation to create the account
        UserOperation memory op = constructUserOperation(expectedAddress, 0, initCode, callData);

        // Sign the UserOperation
        bytes memory sig = LightWalletUtils.signDigest(vm, entryPoint.getUserOpHash(op), expectedAddress, deployerKey);

        // Construct the UserOperation
        op.signature = LightWalletUtils.packLegacySignature(sig, weight, threshold, checkpoint);

        // Construct the ops
        UserOperation[] memory ops = new UserOperation[](1);
        ops[0] = op;

        // Handle the ops
        sendUserOperation(op);

        // solhint-disable-next-line no-console
        console.log("LightWallet to be deployed at address: %s", address(expectedAddress));
        // assert(address(expectedAddress).code.length > 0);

        return wallet;
    }
}
