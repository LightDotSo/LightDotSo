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

import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {Vm} from "forge-std/Test.sol";

/// @title LightWalletUtils
/// @author shunkakinoki
/// @notice LightWalletUtils is a utility library for the wallet

library LightWalletUtils {
    // -------------------------------------------------------------------------
    // Utility Functions
    // -------------------------------------------------------------------------

    /// @notice Gets the expected image hash
    /// @param _user The user address
    /// @param _weight The weight
    /// @param _threshold The threshold
    /// @param _checkpoint The checkpoint
    function getExpectedImageHash(address _user, uint8 _weight, uint16 _threshold, uint32 _checkpoint)
        internal
        pure
        returns (bytes32)
    {
        // Calculate the image hash
        bytes32 expectedImageHash = abi.decode(abi.encodePacked(uint96(_weight), _user), (bytes32));
        expectedImageHash = keccak256(abi.encodePacked(expectedImageHash, uint256(_threshold)));
        expectedImageHash = keccak256(abi.encodePacked(expectedImageHash, uint256(_checkpoint)));

        return expectedImageHash;
    }

    /// @notice Signs a digest
    /// @param _vm The VM instance for signing
    /// @param _hash The hash to sign
    /// @param _account The account address
    /// @param _userKey The user key
    /// @param _isSign Whether to sign with EIP-191 flag
    function signDigest(Vm _vm, bytes32 _hash, address _account, uint256 _userKey, bool _isSign)
        internal
        view
        returns (bytes memory)
    {
        // Create the subdigest
        bytes32 subdigest = keccak256(abi.encodePacked("\x19\x01", block.chainid, address(_account), _hash));

        // The actual hash that was signed w/ EIP-191 flag
        bytes32 signed_subdigest = _isSign ? MessageHashUtils.toEthSignedMessageHash(subdigest) : subdigest;

        // Create the signature w/ the subdigest
        (uint8 v, bytes32 r, bytes32 s) = _vm.sign(_userKey, signed_subdigest);

        // Pack the signature w/ EIP-712 flag
        bytes memory sig = abi.encodePacked(r, s, v, uint8(_isSign ? 2 : 1));

        return sig;
    }

    /// @notice Packs the legacy signature
    /// @param _sig The signature
    /// @param _weight The weight
    /// @param _threshold The threshold
    /// @param _checkpoint The checkpoint
    function packLegacySignature(bytes memory _sig, uint8 _weight, uint16 _threshold, uint32 _checkpoint)
        internal
        pure
        returns (bytes memory)
    {
        // Flag for legacy signature
        uint8 legacySignatureFlag = uint8(0);

        // Pack the signature w/ flag, weight, threshold, checkpoint
        bytes memory encoded = abi.encodePacked(_threshold, _checkpoint, legacySignatureFlag, _weight, _sig);

        return encoded;
    }
}
