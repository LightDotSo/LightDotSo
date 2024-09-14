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

import {PackedUserOperation} from "@/contracts/LightWallet.sol";
import {LightWalletFactory} from "@/contracts/LightWalletFactory.sol";
import {SimpleAccountFactory} from "@/contracts/samples/SimpleAccountFactory.sol";
import {BaseLightDeployerFlow} from "@/script/base/BaseLightDeployerFlow.s.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
// solhint-disable-next-line no-console
import {console} from "forge-std/console.sol";

// LightPaymasterVerify -- Test Deployment
contract LightPaymasterVerifyFlowScript is BaseLightDeployerFlow {
    // -------------------------------------------------------------------------
    // Run
    // -------------------------------------------------------------------------

    function run() public {
        PackedUserOperation memory op = PackedUserOperation(
            address(0),
            uint256(0),
            "",
            "",
            bytes32(0),
            uint256(0),
            bytes32(0),
            abi.encodePacked(
                address(LIGHT_PAYMASTER_ADDRESS),
                abi.encode(uint48(0), uint48(0)),
                hex"000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
            ),
            ""
        );
        bytes32 emptyHash = paymaster.getHash(op, 0, 0);

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

        // Deploy a new LightWallet
        // UserOperation to create the account
        op = constructUserOperation(expectedAddress, 0, initCode, callData, false);

        // solhint-disable-next-line no-console
        console.logBytes(op.paymasterAndData);

        (uint48 validUntil, uint48 validAfter, bytes memory signature) =
            paymaster.parsePaymasterAndData(op.paymasterAndData);

        // solhint-disable-next-line no-console
        console.logBytes(signature);

        op.signature = "";
        op.paymasterAndData = abi.encodePacked(
            address(LIGHT_PAYMASTER_ADDRESS),
            abi.encode(validUntil, validAfter),
            hex"000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
        );

        bytes32 beforeHash = paymaster.getHash(op, validUntil, validAfter);

        // solhint-disable-next-line no-console
        console.logBytes32(beforeHash);

        writeUserOperationJson(op);
        bytes32 hash = MessageHashUtils.toEthSignedMessageHash(beforeHash);

        // solhint-disable-next-line no-console
        console.logBytes32(hash);

        address signer = ECDSA.recover(hash, signature);

        // solhint-disable-next-line no-console
        console.logAddress(signer);
        assertEq(signer, OFFCHAIN_VERIFIER_ADDRESS);
        // assertEq(signer, address(0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf));
    }
}
