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

pragma solidity ^0.8.18;

import {ECDSA} from "@openzeppelin/contracts-v4.9/utils/cryptography/ECDSA.sol";
import {Test, Vm} from "forge-std/Test.sol";

/// @title LightWalletUtils
/// @author shunkakinoki
/// @notice LightWalletUtils is a utility library for the wallet
library LightWalletUtils {
    function getExpectedImageHash(address user, uint8 weight, uint16 threshold, uint32 checkpoint)
        internal
        pure
        returns (bytes32)
    {
        // Calculate the image hash
        bytes32 expectedImageHash = abi.decode(abi.encodePacked(uint96(weight), user), (bytes32));
        expectedImageHash = keccak256(abi.encodePacked(expectedImageHash, uint256(threshold)));
        expectedImageHash = keccak256(abi.encodePacked(expectedImageHash, uint256(checkpoint)));

        return expectedImageHash;
    }

    function signDigest(Vm _vm, bytes32 hash, address account, uint256 userKey, bool isSign)
        internal
        view
        returns (bytes memory)
    {
        // Create the subdigest
        bytes32 subdigest = keccak256(abi.encodePacked("\x19\x01", block.chainid, address(account), hash));

        // The actual hash that was signed w/ EIP-191 flag
        bytes32 signed_subdigest = isSign ? ECDSA.toEthSignedMessageHash(subdigest) : subdigest;

        // Create the signature w/ the subdigest
        (uint8 v, bytes32 r, bytes32 s) = _vm.sign(userKey, signed_subdigest);

        // Pack the signature w/ EIP-712 flag
        bytes memory sig = abi.encodePacked(r, s, v, uint8(isSign ? 2 : 1));

        return sig;
    }

    function packLegacySignature(bytes memory sig, uint8 weight, uint16 threshold, uint32 checkpoint)
        internal
        pure
        returns (bytes memory)
    {
        // Flag for legacy signature
        uint8 legacySignatureFlag = uint8(0);

        // Pack the signature w/ flag, weight, threshold, checkpoint
        bytes memory encoded = abi.encodePacked(threshold, checkpoint, legacySignatureFlag, weight, sig);

        return encoded;
    }
}
