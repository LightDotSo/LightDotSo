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

// Contract to validate signatures using EIP-1271 and EIP-6492
// Source from the official EIP
// Link: https://eips.ethereum.org/EIPS/eip-6492
// License: CC-BY-SA-4.0

pragma solidity ^0.8.27;

import {IERC1271} from "@/contracts/interfaces/IERC1271.sol";

error ERC1271Revert(bytes error);
error ERC6492DeployFailed(bytes error);

contract UniversalSigValidator {
    bytes32 private constant ERC6492_DETECTION_SUFFIX =
        0x6492649264926492649264926492649264926492649264926492649264926492;
    bytes4 private constant ERC1271_SUCCESS = 0x1626ba7e;

    function isValidSigImpl(
        address _signer,
        bytes32 _hash,
        bytes calldata _signature,
        bool allowSideEffects,
        bool tryPrepare
    )
        public
        returns (bool)
    {
        uint256 contractCodeLen = address(_signer).code.length;
        bytes memory sigToValidate;
        // The order here is striclty defined in https://eips.ethereum.org/EIPS/eip-6492
        // - ERC-6492 suffix check and verification first, while being permissive in case the
        // contract is already deployed; if the contract is deployed we will check the sig against
        // the deployed version, this allows 6492 signatures to still be validated while taking into
        // account potential key rotation
        // - ERC-1271 verification if there's contract code
        // - finally, ecrecover
        bool isCounterfactual = bytes32(_signature[_signature.length - 32:_signature.length])
            == ERC6492_DETECTION_SUFFIX;
        if (isCounterfactual) {
            address create2Factory;
            bytes memory factoryCalldata;
            (create2Factory, factoryCalldata, sigToValidate) =
                abi.decode(_signature[0:_signature.length - 32], (address, bytes, bytes));

            if (contractCodeLen == 0 || tryPrepare) {
                (bool success, bytes memory err) = create2Factory.call(factoryCalldata);
                if (!success) revert ERC6492DeployFailed(err);
            }
        } else {
            sigToValidate = _signature;
        }

        // Try ERC-1271 verification
        if (isCounterfactual || contractCodeLen > 0) {
            try IERC1271(_signer).isValidSignature(_hash, sigToValidate) returns (bytes4 magicValue)
            {
                bool isValid = magicValue == ERC1271_SUCCESS;

                // retry, but this time assume the prefix is a prepare call
                if (!isValid && !tryPrepare && contractCodeLen > 0) {
                    return isValidSigImpl(_signer, _hash, _signature, allowSideEffects, true);
                }

                if (contractCodeLen == 0 && isCounterfactual && !allowSideEffects) {
                    // if the call had side effects we need to return the
                    // result using a `revert` (to undo the state changes)
                    assembly {
                        mstore(0, isValid)
                        revert(31, 1)
                    }
                }

                return isValid;
            } catch (bytes memory err) {
                // retry, but this time assume the prefix is a prepare call
                // if (!isValid && !tryPrepare && contractCodeLen > 0) {
                if (!tryPrepare && contractCodeLen > 0) {
                    return isValidSigImpl(_signer, _hash, _signature, allowSideEffects, true);
                }

                revert ERC1271Revert(err);
            }
        }

        // ecrecover verification
        require(
            _signature.length == 65, "SignatureValidator#recoverSigner: invalid signature length"
        );
        bytes32 r = bytes32(_signature[0:32]);
        bytes32 s = bytes32(_signature[32:64]);
        uint8 v = uint8(_signature[64]);
        if (v != 27 && v != 28) {
            revert("SignatureValidator: invalid signature v value");
        }
        return ecrecover(_hash, v, r, s) == _signer;
    }

    function isValidSigWithSideEffects(
        address _signer,
        bytes32 _hash,
        bytes calldata _signature
    )
        external
        returns (bool)
    {
        return this.isValidSigImpl(_signer, _hash, _signature, true, false);
    }

    function isValidSig(
        address _signer,
        bytes32 _hash,
        bytes calldata _signature
    )
        external
        returns (bool)
    {
        try this.isValidSigImpl(_signer, _hash, _signature, false, false) returns (bool isValid) {
            return isValid;
        } catch (bytes memory error) {
            // in order to avoid side effects from the contract getting deployed, the entire call
            // will revert with a single byte result
            uint256 len = error.length;
            if (len == 1) {
                return error[0] == 0x01;
            }
            // all other errors are simply forwarded, but in custom formats so that nothing else can
            // revert with a single byte in the call
            else {
                assembly {
                    revert(error, len)
                }
            }
        }
    }
}

// this is a helper so we can perform validation in a single eth_call without pre-deploying a
// singleton
contract ValidateSigOffchain {
    constructor(address _signer, bytes32 _hash, bytes memory _signature) {
        UniversalSigValidator validator = new UniversalSigValidator();
        bool isValidSig = validator.isValidSigWithSideEffects(_signer, _hash, _signature);
        assembly {
            mstore(0, isValidSig)
            return(31, 1)
        }
    }
}
