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

// From:
// https://github.com/bgd-labs/solidity-utils/blob/a842c36308e76b8202a46962a6c2d59daceb640a/src/contracts/utils/ScriptUtils.sol#L81C1-L160C2
// License: MIT

library Create2Utils {
    // https://github.com/safe-global/safe-singleton-factory
    address public constant CREATE2_FACTORY = 0x914d7Fec6aaC8cd542e72Bca78B30650d45643d7;

    function create2Deploy(
        bytes32 salt,
        bytes memory bytecode,
        bytes memory arguments
    )
        internal
        returns (address)
    {
        if (isContractDeployed(CREATE2_FACTORY) == false) {
            revert("MISSING_CREATE2_FACTORY");
        }
        address computed = computeCreate2Address(salt, bytecode, arguments);

        if (isContractDeployed(computed)) {
            return computed;
        } else {
            bytes memory creationBytecode =
                abi.encodePacked(salt, abi.encodePacked(bytecode, arguments));
            bytes memory returnData;
            (, returnData) = CREATE2_FACTORY.call(creationBytecode);
            address deployedAt = address(uint160(bytes20(returnData)));
            require(deployedAt == computed, "failure at create2 address derivation");
            return deployedAt;
        }
    }

    function create2Deploy(bytes32 salt, bytes memory bytecode) internal returns (address) {
        if (isContractDeployed(CREATE2_FACTORY) == false) {
            revert("MISSING_CREATE2_FACTORY");
        }
        address computed = computeCreate2Address(salt, bytecode);

        if (isContractDeployed(computed)) {
            return computed;
        } else {
            bytes memory creationBytecode = abi.encodePacked(salt, bytecode);
            bytes memory returnData;
            (, returnData) = CREATE2_FACTORY.call(creationBytecode);
            address deployedAt = address(uint160(bytes20(returnData)));
            require(deployedAt == computed, "failure at create2 address derivation");
            return deployedAt;
        }
    }

    function isContractDeployed(address _addr) internal view returns (bool isContract) {
        return (_addr.code.length > 0);
    }

    function computeCreate2Address(
        bytes32 salt,
        bytes32 initcodeHash
    )
        internal
        pure
        returns (address)
    {
        return addressFromLast20Bytes(
            keccak256(abi.encodePacked(bytes1(0xff), CREATE2_FACTORY, salt, initcodeHash))
        );
    }

    function computeCreate2Address(
        bytes32 salt,
        bytes memory bytecode
    )
        internal
        pure
        returns (address)
    {
        return computeCreate2Address(salt, keccak256(abi.encodePacked(bytecode)));
    }

    function computeCreate2Address(
        bytes32 salt,
        bytes memory bytecode,
        bytes memory arguments
    )
        internal
        pure
        returns (address)
    {
        return computeCreate2Address(salt, keccak256(abi.encodePacked(bytecode, arguments)));
    }

    function addressFromLast20Bytes(bytes32 bytesValue) internal pure returns (address) {
        return address(uint160(uint256(bytesValue)));
    }
}
