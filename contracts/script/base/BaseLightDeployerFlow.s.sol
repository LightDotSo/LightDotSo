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

import {
    ENTRY_POINT_ADDRESS,
    LIGHT_WALLET_FACTORY_ADDRESS,
    LIGHT_PAYMASTER_ADDRESS,
    SIMPLE_ACCOUNT_FACTORY_ADDRESS
} from "@/constants/address.sol";
import {EntryPoint} from "@/contracts/core/EntryPoint.sol";
import {LightWallet} from "@/contracts/LightWallet.sol";
import {LightWalletFactory} from "@/contracts/LightWalletFactory.sol";
import {LightPaymaster} from "@/contracts/LightPaymaster.sol";
import {PackedUserOperation} from "@/contracts/LightWallet.sol";
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
        factory = LightWalletFactory(LIGHT_WALLET_FACTORY_ADDRESS);

        // LightPaymaster core contract
        paymaster = LightPaymaster(payable(LIGHT_PAYMASTER_ADDRESS));

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
        bytes memory callData,
        bool isLightWallet
    ) internal returns (PackedUserOperation memory op) {
        // Get the paymaster request gas and paymaster and data
        (
            uint256 preVerificationGas,
            uint128 verificationGasLimit,
            uint128 callGasLimit,
            bytes memory paymasterAndData,
            uint128 maxFeePerGas,
            uint128 maxPriorityFeePerGas
        ) = getPaymasterRequestGasAndPaymasterAndData(expectedAddress, nonce, initCode, callData, isLightWallet);

        bytes32 accountGasLimits = ERC4337Utils.packAccountGasLimits(verificationGasLimit, callGasLimit);
        bytes32 gasFees = ERC4337Utils.packGasFees(maxPriorityFeePerGas, maxFeePerGas);

        // Get the gas estimation
        // (uint256 preVerificationGas, uint256 verificationGasLimit, uint256 callGasLimit) =
        // getEthEstimateUserOperationGas(expectedAddress, initCode);

        // UserOperation to create the account
        op = PackedUserOperation(
            expectedAddress,
            nonce,
            initCode,
            callData,
            accountGasLimits,
            preVerificationGas,
            gasFees,
            paymasterAndData,
            ""
        );
    }

    /// @dev Handle the ops with the entryPoint
    function handleOps(PackedUserOperation memory op) internal {
        // Construct the ops
        PackedUserOperation[] memory ops = new PackedUserOperation[](1);
        ops[0] = op;

        // Handle the ops
        entryPoint.handleOps(ops, payable(address(1)));
    }

    /// @dev Simulate the ops with the entryPoint
    function simulateValidation(PackedUserOperation memory op) internal {
        // Simulate the UserOperation
        // entryPoint.simulateValidation(op);
    }

    /// @dev Deploy the SimpleAccount contract
    function deploySimpleAccount() internal {
        // Set the nonce
        uint256 nonce = randomSeed();

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
        PackedUserOperation memory op = constructUserOperation(expectedAddress, 0, initCode, callData, false);

        // -------------------------------------------------------------------------

        // Empty the paymasterAndData
        // op.paymasterAndData = "";

        // -------------------------------------------------------------------------

        // Sign the UserOperation
        bytes memory sig = entryPoint.signUserOp(vm, deployerKey, op);

        // Construct the UserOperation
        op.signature = sig;

        // Write the json
        writeUserOperationJson(op);

        // Simulate the validation
        // try simulateValidation(op) {} catch {}

        // Handle the validation
        // handleOps(op);

        // Handle the ops
        sendUserOperation(op);
    }

    /// @dev Deploy the LightWallet contract
    function deployLightWallet() internal returns (LightWallet) {
        // Set the nonce
        nonce = randomNonce();

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
            LIGHT_WALLET_FACTORY_ADDRESS,
            abi.encodeWithSelector(LightWalletFactory.createAccount.selector, expectedImageHash, nonce)
        );

        // solhint-disable-next-line no-console
        console.logBytes(initCode);

        // Sent ETH to the account w/ the expected address
        // bytes memory callData = abi.encodeWithSelector(LightWallet.execute.selector, address(1), 1, bytes(""));
        bytes memory callData = "";

        // UserOperation to create the account
        PackedUserOperation memory op = constructUserOperation(expectedAddress, 0, initCode, callData, true);

        // Sign the UserOperation
        bytes memory sig =
            LightWalletUtils.signDigest(vm, entryPoint.getUserOpHash(op), expectedAddress, deployerKey, false);

        // Construct the UserOperation
        op.signature = LightWalletUtils.packLegacySignature(sig, weight, threshold, checkpoint);

        // Write the json
        writeUserOperationJson(op);

        // Construct the ops
        PackedUserOperation[] memory ops = new PackedUserOperation[](1);
        ops[0] = op;

        // Handle the ops
        sendUserOperation(op);

        // solhint-disable-next-line no-console
        console.log("LightWallet to be deployed at address: %s", address(expectedAddress));
        // assert(address(expectedAddress).code.length > 0);

        return wallet;
    }
}
