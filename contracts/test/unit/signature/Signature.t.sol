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

import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {Merkle} from "murky/Merkle.sol";
import "solidity-bytes-utils/BytesLib.sol";
import {EntryPoint} from "@/contracts/core/EntryPoint.sol";
import {LightWallet, UserOperation} from "@/contracts/LightWallet.sol";
import {BaseTest} from "@/test/base/BaseTest.t.sol";
import {ERC4337Utils} from "@/test/utils/ERC4337Utils.sol";
// solhint-disable-next-line no-console
import {console} from "forge-std/console.sol";

using BytesLib for bytes;
using ERC4337Utils for EntryPoint;

/// @notice Unit tests for `LightWallet` Signature
contract StorageUnitTest is BaseTest {
    // -------------------------------------------------------------------------
    // Variables
    // -------------------------------------------------------------------------

    // Merkle utility
    Merkle internal m;

    // -------------------------------------------------------------------------
    // Setup
    // -------------------------------------------------------------------------

    function setUp() public virtual override {
        // Construct the merkle utility w/ murky
        m = new Merkle();
    }

    // -------------------------------------------------------------------------
    // Tests
    // -------------------------------------------------------------------------

    function test_merkle_verify() public {
        bytes32[] memory proofs = new bytes32[](2);
        proofs[0] = bytes32(0x0000000000000000000000000000000000000000000000000000000000000002);
        proofs[1] = bytes32(0x0000000000000000000000000000000000000000000000000000000000000003);

        assertTrue(
            MerkleProof.verify(
                proofs,
                bytes32(0x9b0225f2c6f59eeaf8302811ea290e95258763189b82dc033158e99a6ef45a87),
                bytes32(0x0000000000000000000000000000000000000000000000000000000000000001)
            )
        );
    }

    /// Tests that the account can correctly transfer ETH
    function test_merkle_decoding() public {
        // Attempt to decode the signature and proof
        (bytes32 decodedMerkleRoot, bytes32[] memory decodedMerkleProofs, bytes memory decodedSignature) = abi.decode(
            hex"7acd7defebfae0bc5b072d84cd2eb10c3c6fc7e5534720c05367517825886d8c000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000002812eb56f4848ce3e5ef63a2a6a1536c3cb000cbe6847751d927df51378ad9b7efacb48a8314f89b85e1010862fba17249cd0ad43ae0a37895bad2423c5b9290600000000000000000000000000000000000000000000000000000000000000610200010000000000018c062a0db2d01da629617a35cb321ce9acb9c23b7b7b5ff973cddb5a276e760b7310ea55b3190ada9870a85ca4ba205cb22b3583d4f7d5310dcbebc7ab9f6e7f1c0201012af8ddab77a7c90a38cf26f29763365d0028cfef00000000000000000000000000000000000000000000000000000000000000",
            (bytes32, bytes32[], bytes)
        );
        // solhint-disable-next-line no-console
        console.logBytes32(decodedMerkleRoot);
        // solhint-disable-next-line no-console
        console.logBytes32(decodedMerkleProofs[0]);
        // solhint-disable-next-line no-console
        console.logBytes32(decodedMerkleProofs[1]);
        // solhint-disable-next-line no-console
        console.logBytes(decodedSignature);

        assertFalse(
            MerkleProof.verify(
                decodedMerkleProofs,
                decodedMerkleRoot,
                bytes32(0x6680a0583232a31e85810a6d47f348b0d068a949f9745b51a830c4f9117f13b8)
            )
        );
    }
}
