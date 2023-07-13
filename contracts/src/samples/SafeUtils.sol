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

import {Test} from "forge-std/Test.sol";

/// @title SafeUtils
/// @author shunkakinoki
/// @notice SafeUtils is a utility contract for the Safe
contract SafeUtils is Test {
    // Parameters for the signature
    uint8 private weight = uint8(1);
    uint16 private threshold = uint16(1);
    uint32 private checkpoint = uint32(1);

    function getExpectedImageHash(address user) public view returns (bytes32) {
        // Calculate the image hash
        bytes32 expectedImageHash = abi.decode(abi.encodePacked(uint96(weight), user), (bytes32));
        expectedImageHash = keccak256(abi.encodePacked(expectedImageHash, uint256(threshold)));
        expectedImageHash = keccak256(abi.encodePacked(expectedImageHash, uint256(checkpoint)));

        return expectedImageHash;
    }

    function signDigest(bytes32 hash, address account, uint256 userKey) public view returns (bytes memory) {
        // Create the subdigest
        bytes32 subdigest = keccak256(abi.encodePacked("\x19\x01", block.chainid, address(account), hash));

        // Create the signature w/ the subdigest
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(userKey, subdigest);

        // Pack the signature w/ EIP-712 flag
        bytes memory sig = abi.encodePacked(r, s, v, uint8(1));

        return sig;
    }

    function packLegacySignature(bytes memory sig) public view returns (bytes memory) {
        // Flag for legacy signature
        uint8 legacySignatureFlag = uint8(0);

        // Pack the signature w/ flag, weight, threshold, checkpoint
        bytes memory encoded = abi.encodePacked(threshold, checkpoint, legacySignatureFlag, weight, sig);

        return encoded;
    }
}
