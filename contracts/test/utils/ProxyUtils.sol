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
