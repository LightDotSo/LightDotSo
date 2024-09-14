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

// LightWallet.sol -- LightWallet initial implementation

// Core is heavily based by the work of @0xsequence (especially @Agusx1211)
// Link: https://github.com/0xsequence/wallet-contracts/blob/46838284e90baf27cf93b944b056c0b4a64c9733/contracts/modules/MainModuleUpgradable.sol
// License: Apache-2.0

// ECDSAValidator is heavily based by the work of @bcnmy's MultichainECDSAValidator
// Link: https://raw.githubusercontent.com/bcnmy/scw-contracts/8c71c2a6404feb3eef85d1a2707042114b204878/contracts/smart-account/modules/MultichainECDSAValidator.sol
// License: MIT

// Thank you to both teams for the ever amazing work!

import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import {BaseAccount} from "@eth-infinitism/account-abstraction/contracts/core/BaseAccount.sol";
import {
    SIG_VALIDATION_FAILED,
    SIG_VALIDATION_SUCCESS
} from "@eth-infinitism/account-abstraction/contracts/core/Helpers.sol";
import {TokenCallbackHandler} from
    "@eth-infinitism/account-abstraction/contracts/samples/callback/TokenCallbackHandler.sol";
import {IEntryPoint} from "@eth-infinitism/account-abstraction/contracts/interfaces/IEntryPoint.sol";
import {PackedUserOperation} from "@eth-infinitism/account-abstraction/contracts/interfaces/PackedUserOperation.sol";
import {ModuleAuth} from "@0xsequence/wallet-contracts/contracts/modules/commons/ModuleAuth.sol";
import {ModuleAuthUpgradable} from "@0xsequence/wallet-contracts/contracts/modules/commons/ModuleAuthUpgradable.sol";
import {ILightWallet} from "@/contracts/interfaces/ILightWallet.sol";

/// @title LightWallet
/// @author @shunkakinoki
/// @notice LightWallet is an account abstraction contract
contract LightWallet is
    ILightWallet,
    ModuleAuthUpgradable,
    BaseAccount,
    TokenCallbackHandler,
    UUPSUpgradeable,
    Initializable
{
    // -------------------------------------------------------------------------
    // Constant
    // -------------------------------------------------------------------------

    /// @notice The name for this contract
    string public constant NAME = "LightWallet";

    /// @notice The version for this contract
    string public constant VERSION = "0.4.0";

    // -------------------------------------------------------------------------
    // Immutable Storage
    // -------------------------------------------------------------------------

    /// @notice The entry point contract for this account
    IEntryPoint private immutable _entryPoint;

    // -------------------------------------------------------------------------
    // Constructor + Functions
    // -------------------------------------------------------------------------

    /// @inheritdoc BaseAccount
    function entryPoint() public view virtual override(BaseAccount, ILightWallet) returns (IEntryPoint) {
        return _entryPoint;
    }

    // solhint-disable-next-line no-empty-blocks
    receive() external payable {}

    /// @param anEntryPoint The address of the entrypoint contract.
    /// @dev Should be set to the address of the EntryPoint contract
    /// The official EntryPoint contract is at https://etherscan.io/address/0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789
    constructor(IEntryPoint anEntryPoint) {
        _entryPoint = anEntryPoint;
        _disableInitializers();
    }

    /// @param dest The address of the target contract to call.
    /// @param value The amount of Wei (ETH) to send along with the call.
    /// @param func The calldata to send to the target contract.
    /// @notice Executes a transaction (called directly by entryPoint)
    function execute(address dest, uint256 value, bytes calldata func) external {
        _requireFromEntryPoint();
        _call(dest, value, func);
    }

    /// @param dest The array of address of the target contract to call.
    /// @param value The array of amount of Wei (ETH) to send along with the call.
    /// @param func The array of calldata to send to the target contract.
    /// @dev to reduce gas consumption for trivial case (no value), use a zero-length array to mean zero value
    /// @notice Executes a sequence of transactions (called directly by entryPoint)
    function executeBatch(address[] calldata dest, uint256[] calldata value, bytes[] calldata func) external {
        _requireFromEntryPoint();
        require(dest.length == func.length && (value.length == 0 || value.length == func.length), "wrong array lengths");
        if (value.length == 0) {
            for (uint256 i = 0; i < dest.length; i++) {
                _call(dest[i], 0, func[i]);
            }
        } else {
            for (uint256 i = 0; i < dest.length; i++) {
                _call(dest[i], value[i], func[i]);
            }
        }
    }

    /// @inheritdoc ModuleAuth
    function isValidSignature(bytes32 hash, bytes calldata signatures)
        public
        view
        override(ILightWallet, ModuleAuth)
        returns (bytes4)
    {
        return super.isValidSignature(hash, signatures);
    }

    /// @param imageHash The hash to validate the signature against.
    /// @notice The _entryPoint member is immutable, to reduce gas consumption. To upgrade EntryPoint,
    /// a new implementation of SimpleAccount must be deployed with the new EntryPoint address, then upgrading
    /// the implementation by calling `upgradeTo()`
    function initialize(bytes32 imageHash) public virtual initializer {
        _initialize(imageHash);
    }

    // -------------------------------------------------------------------------
    // Internal
    // -------------------------------------------------------------------------

    /// @param imageHash The hash to validate the signature against.
    /// @notice Emits an event for the initialization of the contract
    function _initialize(bytes32 imageHash) internal virtual {
        _updateImageHash(imageHash);
        emit LightWalletInitialized(_entryPoint, imageHash);
    }

    /// @inheritdoc BaseAccount
    function _validateSignature(PackedUserOperation calldata userOp, bytes32 userOpHash)
        internal
        virtual
        override
        returns (uint256 validationData)
    {
        bytes1 signatureType = userOp.signature[0];

        // Thank you to @pseudolabel & @fiveoutofnine for the bitwise op suggestion!
        // Equivalent to signatureType == 0x00 || signatureType == 0x01 || signatureType == 0x02 || signatureType == 0x03
        if (signatureType & 0x03 == signatureType) {
            (bool isValid,) = _signatureValidation(userOpHash, userOp.signature);
            if (!isValid) {
                return SIG_VALIDATION_FAILED;
            }
            return SIG_VALIDATION_SUCCESS;
        }

        // If the signature type is 0x04, it is a merkle proof signature
        // This enables batch execution of transactions across chains
        // Modeled after the work of @bcnmy's MultichainECDSAValidator
        if (signatureType == 0x04) {
            (bytes32 merkleTreeRoot, bytes32[] memory merkleProof, bytes memory merkleSignature) =
                abi.decode(userOp.signature[1:], (bytes32, bytes32[], bytes));

            // Verify the corresponding merkle proof for the userOpHash
            if (!MerkleProof.verify(merkleProof, merkleTreeRoot, userOpHash)) {
                revert InvalidMerkleProof(merkleTreeRoot, userOpHash);
            }

            // Get the offset of the actual signature
            // Hardcoded to the corresponding length depending on the merkleProof length
            // 1st part is the bytes32 merkleTreeRoot
            // 2nd part is the offset of the bytes32[] merkleProof
            // 3rd part is the offset of the bytes merkleSignature
            // 4th part is the length of the bytes32[] merkleProof, and the contents of the array (32 bytes each)
            // 5th part is the length of the bytes merkleSignature
            // 1byte is added to the offset to account for the signatureType
            uint256 offset = 161 + merkleProof.length * 32;
            (bool isValid,) =
                _signatureValidation(merkleTreeRoot, userOp.signature[offset:offset + merkleSignature.length]);
            if (!isValid) {
                return SIG_VALIDATION_FAILED;
            }
            return SIG_VALIDATION_SUCCESS;
        }

        // Return an error if the signature type is not recognized
        return SIG_VALIDATION_FAILED;
    }

    /// @notice Executes a call to a target contract with specified value and data.
    /// @param target The address of the target contract to call.
    /// @param value The amount of Wei (ETH) to send along with the call.
    /// @param data The data payload to send along with the call.
    /// @dev This internal function uses the `call` function to make an external call to the target contract
    /// with the specified value and data. It captures the success status and returned data of the call.
    /// If the call is not successful, it reverts the transaction and provides the error message from the target contract.
    // slither-disable-start low-level-calls
    // slither-disable-next-line arbitrary-send-eth
    function _call(address target, uint256 value, bytes memory data) internal {
        // slither-disable-next-line calls-loop
        (bool success, bytes memory result) = target.call{value: value}(data);
        if (!success) {
            // slither-disable-next-line assembly
            assembly {
                revert(add(result, 32), mload(result))
            }
        }
    }
    // slither-disable-end low-level-calls

    // -------------------------------------------------------------------------
    // Upgrades
    // -------------------------------------------------------------------------

    /// @dev Only callable by the current contract
    /// @inheritdoc UUPSUpgradeable
    function _authorizeUpgrade(address) internal view override onlySelf {}

    // -------------------------------------------------------------------------
    // Compatibility
    // -------------------------------------------------------------------------

    /// @inheritdoc ModuleAuthUpgradable
    // slither-disable-next-line naming-convention
    function supportsInterface(bytes4 interfaceId)
        public
        pure
        override(ILightWallet, TokenCallbackHandler, ModuleAuthUpgradable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
