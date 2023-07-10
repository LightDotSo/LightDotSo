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

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import {Test} from "forge-std/Test.sol";

// Originally from Aave-Vault
// Link: https://github.com/aave/Aave-Vault/blob/23366cc1188cf901585cf487e811e97fd712e6e5/test/utils/ProxyUtils.sol
// License: MIT License
contract ProxyUtils is Test {
    function getProxyImplementation(address proxyAddress) public view returns (address addr) {
        bytes32 implSlot = bytes32(uint256(keccak256("eip1967.proxy.implementation")) - 1);
        bytes32 proxySlot = vm.load(proxyAddress, implSlot);
        assembly {
            mstore(0, proxySlot)
            addr := mload(0)
        }
    }

    function getProxyAdmin(address proxyAddress) public view returns (address addr) {
        bytes32 adminSlot = bytes32(uint256(keccak256("eip1967.proxy.admin")) - 1);
        bytes32 proxySlot = vm.load(proxyAddress, adminSlot);
        assembly {
            mstore(0, proxySlot)
            addr := mload(0)
        }
    }

    function getCreationCode(address proxyAddress) external view returns (bytes memory) {
        bytes memory code;
        assembly {
            // Size of the creation code
            let size := extcodesize(proxyAddress)

            // Allocate memory for the creation code
            code := mload(0x40)
            mstore(0x40, add(code, and(add(add(size, 0x20), 0x1f), not(0x1f))))

            // Retrieve the creation code
            extcodecopy(proxyAddress, add(code, 0x20), 0, size)
        }
        return code;
    }
}
