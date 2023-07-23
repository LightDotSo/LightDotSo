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

/// @notice Utility functions for proxies
contract ProxyUtils is Test {
    // -------------------------------------------------------------------------
    // Public Functions
    // -------------------------------------------------------------------------

    /// @param _proxyAddress The address of the proxy
    /// @dev Gets the implementation address of a proxy
    function getProxyImplementation(address _proxyAddress) public view returns (address addr) {
        bytes32 implSlot = bytes32(uint256(keccak256("eip1967.proxy.implementation")) - 1);
        bytes32 proxySlot = vm.load(_proxyAddress, implSlot);
        assembly {
            mstore(0, proxySlot)
            addr := mload(0)
        }
    }

    /// @param _proxyAddress The address of the proxy
    /// @dev Gets the admin address of a proxy
    function getProxyAdmin(address _proxyAddress) public view returns (address addr) {
        bytes32 adminSlot = bytes32(uint256(keccak256("eip1967.proxy.admin")) - 1);
        bytes32 proxySlot = vm.load(_proxyAddress, adminSlot);
        assembly {
            mstore(0, proxySlot)
            addr := mload(0)
        }
    }

    /// @param _proxyAddress The address of the proxy
    /// @dev Gets the creation code of a proxy
    function getCreationCode(address _proxyAddress) external view returns (bytes memory) {
        bytes memory code;
        assembly {
            // Size of the creation code
            let size := extcodesize(_proxyAddress)

            // Allocate memory for the creation code
            code := mload(0x40)
            mstore(0x40, add(code, and(add(add(size, 0x20), 0x1f), not(0x1f))))

            // Retrieve the creation code
            extcodecopy(_proxyAddress, add(code, 0x20), 0, size)
        }
        return code;
    }
}
