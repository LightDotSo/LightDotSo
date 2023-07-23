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

/// @notice Utility functions for storage
contract StorageUtils is Test {
    // -------------------------------------------------------------------------
    // Public Functions
    // -------------------------------------------------------------------------

    /// @param _addr The address of the contract
    /// @param _slot The location of the bytes32 in storage
    /// @dev Reads a uint256 from storage
    function readBytes32(address _addr, bytes32 _slot) public view returns (bytes32 val) {
        bytes32 storageSlot = vm.load(_addr, _slot);
        assembly {
            mstore(0, storageSlot)
            val := mload(0)
        }
    }
}
