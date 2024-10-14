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

// Copyright 2017-present Horizon Blockchain Games Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.27;

// Core is heavily based by the work of @0xsequence (especially @Agusx1211)
// Link:
// https://github.com/0xsequence/wallet-contracts/blob/46838284e90baf27cf93b944b056c0b4a64c9733/contracts/modules/MainModuleUpgradable.sol
// License: Apache-2.0

// ECDSAValidator is heavily based by the work of @bcnmy's MultichainECDSAValidator
// Link:
// https://raw.githubusercontent.com/bcnmy/scw-contracts/8c71c2a6404feb3eef85d1a2707042114b204878/contracts/smart-account/modules/MultichainECDSAValidator.sol
// License: MIT

// Thank you to both teams for the ever amazing work!j

import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {
    SIG_VALIDATION_FAILED,
    SIG_VALIDATION_SUCCESS
} from "@eth-infinitism/account-abstraction/contracts/core/Helpers.sol";
import {PackedUserOperation} from
    "@eth-infinitism/account-abstraction/contracts/interfaces/PackedUserOperation.sol";
import {ModuleAuthUpgradable} from
    "@0xsequence/wallet-contracts-patch/contracts/modules/commons/ModuleAuthUpgradable.sol";
import {ERC7579ValidatorBase} from "modulekit/Modules.sol";
import {ILightValidator} from "@/contracts/interfaces/ILightValidator.sol";

/// @title LightValidator
/// @author @shunkakinoki
/// @notice LightValidator is an account abstraction contract

contract LightValidator is ILightValidator, ERC7579ValidatorBase, ModuleAuthUpgradable {
    // -------------------------------------------------------------------------
    // Constant
    // -------------------------------------------------------------------------

    /// @notice The name for this contract
    string public constant NAME = "LightValidator";

    /// @notice The version for this contract
    string public constant VERSION = "0.3.0";

    // -------------------------------------------------------------------------
    // Metadata
    // -------------------------------------------------------------------------

    function isModuleType(uint256 typeID) external pure override returns (bool) {
        return typeID == TYPE_VALIDATOR;
    }

    // -------------------------------------------------------------------------
    // Constructor + Functions
    // -------------------------------------------------------------------------

    function onInstall(bytes calldata) external override {
        // Cache the account address
        address account = msg.sender;

        // Decode the image hash
        (bytes32 imageHash) = abi.decode(data, (bytes32));

        // Update the image hash
        _updateImageHash(account, imageHash);

        // Emit the event
        emit ModuleInitialized(account);
    }

    function onUninstall(bytes calldata) external override {
        // Cache the account address
        address account = msg.sender;

        // Reset the image hash
        imageHashes[account] = bytes32(0);

        // Emit the event
        emit ModuleUninitialized(account);
    }

    function isInitialized(address account) public view returns (bool) {
        // Return the result
        return imageHashes[account] != bytes32(0);
    }

    function updateImageHash(bytes32 imageHash) external {
        // Cache the account address
        address account = msg.sender;

        // Update the image hash
        _updateImageHash(account, imageHash);
    }

    function validateUserOp(
        PackedUserOperation calldata userOp,
        bytes32 userOpHash
    )
        external
        view
        override
        returns (ValidationData)
    {
        // Validate the signature with the config
        bool isValid = _validateSignatureWithConfig(userOp.sender, userOpHash, userOp.signature);

        // Return the result
        if (isValid) {
            return VALIDATION_SUCCESS;
        }
        return VALIDATION_FAILED;
    }

    function isValidSignatureWithSender(
        address,
        bytes32 hash,
        bytes calldata data
    )
        external
        view
        override
        returns (bytes4)
    {
        // Validate the signature with the config
        bool isValid = _validateSignatureWithConfig(msg.sender, hash, data);

        // Return the result
        if (isValid) {
            return EIP1271_SUCCESS;
        }
        return EIP1271_FAILED;
    }

    // -------------------------------------------------------------------------
    // Internal
    // -------------------------------------------------------------------------

    function _validateSignatureWithConfig(
        address account,
        bytes32 hash,
        bytes calldata signature
    )
        internal
        view
        returns (bool)
    {
        bytes1 signatureType = signature[0];

        // Thank you to @pseudolabel & @fiveoutofnine for the bitwise op suggestion!
        // Equivalent to signatureType == 0x00 || signatureType == 0x01 || signatureType == 0x02 ||
        // signatureType == 0x03
        if (signatureType & 0x03 == signatureType) {
            (bool isValid,) = _signatureValidation(account, hash, signature);
            return isValid;
        }

        // If the signature type is 0x04, it is a merkle proof signature
        // This enables batch execution of transactions across chains
        // Modeled after the work of @bcnmy's MultichainECDSAValidator
        if (signatureType == 0x04) {
            (bytes32 merkleTreeRoot, bytes32[] memory merkleProof, bytes memory merkleSignature) =
                abi.decode(signature[1:], (bytes32, bytes32[], bytes));

            // Verify the corresponding merkle proof for the hash
            if (!MerkleProof.verify(merkleProof, merkleTreeRoot, hash)) {
                revert InvalidMerkleProof(merkleTreeRoot, hash);
            }

            // Get the offset of the actual signature
            // Hardcoded to the corresponding length depending on the merkleProof length
            // 1st part is the bytes32 merkleTreeRoot
            // 2nd part is the offset of the bytes32[] merkleProof
            // 3rd part is the offset of the bytes merkleSignature
            // 4th part is the length of the bytes32[] merkleProof, and the contents of the array
            // (32 bytes each)
            // 5th part is the length of the bytes merkleSignature
            // 1byte is added to the offset to account for the signatureType
            uint256 offset = 161 + merkleProof.length * 32;
            (bool isValid,) = _signatureValidation(
                account, merkleTreeRoot, signature[offset:offset + merkleSignature.length]
            );
            return isValid;
        }

        // Return an error if the signature type is not recognized
        return false;
    }
}
