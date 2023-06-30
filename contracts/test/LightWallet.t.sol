// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.13;

import "@/contracts/core/EntryPoint.sol";
import "@/contracts/LightWallet.sol";
import "forge-std/Test.sol";

contract TestContract is Test {
    // EntryPoint from eth-inifinitism
    EntryPoint entryPoint;
    // LightWallet core contract
    LightWallet wallet;

    function setUp() public {
        // Deploy the EntryPoint
        entryPoint = new EntryPoint();
        // Deploy the LightWallet
        wallet = new LightWallet(entryPoint);
    }

    function testBar() public {
        assertEq(uint256(1), uint256(1), "ok");
    }

    function testFoo(uint256 x) public {
        vm.assume(x < type(uint128).max);
        assertEq(x + x, x * 2);
    }
}
