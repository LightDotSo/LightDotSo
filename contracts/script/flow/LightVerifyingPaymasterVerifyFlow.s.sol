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

import {UserOperation} from "@/contracts/LightWallet.sol";
import {LightWalletFactory} from "@/contracts/LightWalletFactory.sol";
import {SimpleAccountFactory} from "@/contracts/samples/SimpleAccountFactory.sol";
import {BaseLightDeployerFlow} from "@/script/base/BaseLightDeployerFlow.s.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
// solhint-disable-next-line no-console
import {console} from "forge-std/console.sol";

// LightVerifyingPaymasterVerify -- Test Deployment
contract LightVerifyingPaymasterVerifyFlowScript is BaseLightDeployerFlow {
    // -------------------------------------------------------------------------
    // Run
    // -------------------------------------------------------------------------

    function run() public {
        UserOperation memory op = UserOperation(
            address(0),
            uint256(0),
            "",
            "",
            uint256(0),
            uint256(0),
            uint256(0),
            uint256(0),
            uint256(0),
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
        bytes32 hash = ECDSA.toEthSignedMessageHash(beforeHash);

        // solhint-disable-next-line no-console
        console.logBytes32(hash);

        address signer = ECDSA.recover(hash, signature);

        // solhint-disable-next-line no-console
        console.logAddress(signer);
        assertEq(signer, OFFCHAIN_VERIFIER_ADDRESS);
        // assertEq(signer, address(0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf));
    }
}
