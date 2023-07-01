// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.13;

import "@/contracts/core/EntryPoint.sol";
import "@/contracts/LightWallet.sol";
import "@/contracts/LightWalletFactory.sol";
import "@/contracts/utils/UniversalSigValidator.sol";
import "forge-std/Test.sol";

/// @notice Unit tests for `LightWallet`, organized by functions.
contract LightWalletTest is Test {
    // EntryPoint from eth-inifinitism
    EntryPoint entryPoint;
    // LightWallet core contract
    LightWallet wallet;
    // LightWalletFactory core contract
    LightWalletFactory factory;
    // UniversalSigValidator
    UniversalSigValidator validator;

    function setUp() public {
        // Deploy the EntryPoint
        entryPoint = new EntryPoint();
        // Deploy the LightWalletFactory w/ EntryPoint
        factory = new LightWalletFactory(entryPoint);
        // Deploy the UniversalSigValidator
        validator = new UniversalSigValidator();
    }

    function test_eip1271_6492() public {
        // Create an EOA address of the owner
        address alice = vm.addr(1);
        // Create a LightWallet w/ the factory
        wallet = factory.createAccount(alice, uint256(0));
        // Obtain the signature w/ the EOA
        bytes32 hashed = keccak256("Signed by Alice");
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(1, hashed);
        bytes memory signature = abi.encodePacked(r, s, v);

        // Test the signature w/ EIP-1271
        assertEq(wallet.isValidSignature(hashed, signature), bytes4(0x1626ba7e));

        // Test the signature w/ EIP-6492
        assertEq(validator.isValidSigImpl(address(wallet), hashed, signature, false), true);
        assertEq(validator.isValidSigWithSideEffects(address(wallet), hashed, signature), true);
        assertEq(validator.isValidSig(address(wallet), hashed, signature), true);
    }
}
