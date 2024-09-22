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

import {BaseIntegrationTest} from "@/test/base/BaseIntegrationTest.t.sol";
import {LightWalletFactory} from "@/contracts/LightWalletFactory.sol";
import {LightWalletUtils} from "@/test/utils/LightWalletUtils.sol";

/// @notice Unit tests for `LightWallet` for compatibility w/ ERC-1271
/// @notice See `ERC1271FuzzTest` for fuzz tests
contract IsValidSignatureIntegrationTest is BaseIntegrationTest {
    // -------------------------------------------------------------------------
    // Tests
    // -------------------------------------------------------------------------

    /// Tests that the account complies w/ EIP-1271 and EIP-6492
    /// Ref: https://eips.ethereum.org/EIPS/eip-1271
    /// Ref: https://eips.ethereum.org/EIPS/eip-6492

    function test_WhenTheSignatureIsValid() external {
        // Hash of the message
        bytes32 hashed = keccak256(abi.encodePacked(uint256(1)));

        // Sign the hash
        bytes memory sig = LightWalletUtils.signDigest(vm, hashed, address(account), userKey, false);

        // Pack the signature
        bytes memory signature = LightWalletUtils.packLegacySignature(sig, weight, threshold, checkpoint);

        // Concat the signature w/ the EIP-6492 detection suffix because of the predeployed contract
        bytes memory sig_6492 = abi.encodePacked(
            abi.encode(
                // Nonce is 1 (does not exist)
                address(factory),
                abi.encodeWithSelector(LightWalletFactory.createAccount.selector, expectedImageHash, nonce),
                signature
            ),
            ERC6492_DETECTION_SUFFIX
        );

        // it should return the magic value (0x1626ba7e)
        // it should comply with ERC1271
        assertEq(account.isValidSignature(hashed, signature), bytes4(0x1626ba7e));

        // it should comply with ERC6492
        assertEq(validator.isValidSigImpl(address(account), hashed, signature, false, false), true);
        assertEq(validator.isValidSigWithSideEffects(address(account), hashed, signature), true);
        assertEq(validator.isValidSig(address(account), hashed, signature), true);

        // it should comply with predeployed contracts at ERC6492
        assertEq(validator.isValidSigImpl(address(account), hashed, sig_6492, false, false), true);
        assertEq(validator.isValidSigWithSideEffects(address(account), hashed, sig_6492), true);
        assertEq(validator.isValidSig(address(account), hashed, sig_6492), true);
    }

    function test_RevertWhen_TheSignatureIsInvalid() external {
        // Hash of the message
        bytes32 hashed = keccak256(abi.encodePacked(uint256(0)));
        // Invalid signature of the message
        bytes memory signature = abi.encodePacked(bytes4(0xdeadbeef), bytes32(uint256(0)));

        // Invalid signature of the message
        bytes memory sig_6492 = abi.encodePacked(
            abi.encode(
                // Nonce is 1 (does not exist)
                address(factory),
                abi.encodeWithSelector(LightWalletFactory.createAccount.selector, expectedImageHash, 1),
                signature
            ),
            ERC6492_DETECTION_SUFFIX
        );

        // it should revert with ERC1271
        vm.expectRevert();
        account.isValidSignature(hashed, signature);

        // it should revert with ERC6492
        vm.expectRevert();
        validator.isValidSigImpl(address(account), hashed, signature, false, false);
        vm.expectRevert();
        validator.isValidSigWithSideEffects(address(account), hashed, signature);
        vm.expectRevert();
        validator.isValidSig(address(account), hashed, signature);

        // it should revert with predeployed contracts at ERC6492
        vm.expectRevert();
        validator.isValidSigImpl(address(account), hashed, sig_6492, false, false);
        vm.expectRevert();
        validator.isValidSigWithSideEffects(address(account), hashed, sig_6492);
        vm.expectRevert();
        validator.isValidSig(address(account), hashed, sig_6492);
    }
}
