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

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {Vm} from "forge-std/Test.sol";
import {MagicSpend} from "magic-spend/MagicSpend.sol";

library LightPaymasterUtils {
    // -------------------------------------------------------------------------
    // Utility Functions
    // -------------------------------------------------------------------------

    /// @dev Generates the hash for a withdrawal request
    /// @param _paymaster The address of the LightPaymaster contract
    /// @param _sender The address of the sender
    /// @param _request The withdrawal request
    /// @return The hash of the withdrawal request
    function getWithdrawRequestHash(address _paymaster, address _sender, MagicSpend.WithdrawRequest memory _request)
        public
        view
        returns (bytes32)
    {
        return MessageHashUtils.toEthSignedMessageHash(
            abi.encode(
                _paymaster, _sender, block.chainid, _request.asset, _request.amount, _request.nonce, _request.expiry
            )
        );
    }

    /// @dev Signs a withdrawal request
    /// @param _vm The VM instance for signing
    /// @param _paymaster The address of the LightPaymaster contract
    /// @param _sender The address of the sender
    /// @param _request The withdrawal request to sign
    /// @param _signerKey The private key of the signer
    /// @return signature The signature for the withdrawal request
    function signWithdrawRequest(
        Vm _vm,
        address _paymaster,
        address _sender,
        MagicSpend.WithdrawRequest memory _request,
        uint256 _signerKey
    ) internal view returns (bytes memory signature) {
        bytes32 hash = getWithdrawRequestHash(_paymaster, _sender, _request);
        (uint8 v, bytes32 r, bytes32 s) = _vm.sign(_signerKey, hash);
        signature = abi.encodePacked(r, s, v);
    }

    /// @dev Creates a withdrawal request with a valid signature
    /// @param _vm The VM instance for signing
    /// @param _paymaster The address of the LightPaymaster contract
    /// @param _sender The address of the sender
    /// @param _asset The asset address (use address(0) for native token)
    /// @param _amount The amount to withdraw
    /// @param _nonce The nonce for the withdrawal
    /// @param _expiry The expiry timestamp for the withdrawal
    /// @param _signerKey The private key of the signer
    /// @return request The signed withdrawal request
    function createSignedWithdrawRequest(
        Vm _vm,
        address _paymaster,
        address _sender,
        address _asset,
        uint256 _amount,
        uint256 _nonce,
        uint48 _expiry,
        uint256 _signerKey
    ) internal view returns (MagicSpend.WithdrawRequest memory request) {
        request = MagicSpend.WithdrawRequest({
            asset: _asset,
            amount: _amount,
            nonce: _nonce,
            expiry: _expiry,
            signature: new bytes(0) // Placeholder, will be filled below
        });

        request.signature = signWithdrawRequest(_vm, _paymaster, _sender, request, _signerKey);
    }

    /// @dev Verifies the signature of a withdrawal request
    /// @param _paymaster The address of the LightPaymaster contract
    /// @param _sender The address of the sender
    /// @param _request The withdrawal request to verify
    /// @param _signer The expected signer of the request
    /// @return isValid True if the signature is valid, false otherwise
    function verifyWithdrawRequestSignature(
        address _paymaster,
        address _sender,
        MagicSpend.WithdrawRequest memory _request,
        address _signer
    ) internal view returns (bool isValid) {
        bytes32 hash = getWithdrawRequestHash(_paymaster, _sender, _request);
        return ECDSA.recover(hash, _request.signature) == _signer;
    }
}
