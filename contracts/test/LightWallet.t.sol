// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.18;

import {EntryPoint} from "@/contracts/core/EntryPoint.sol";
import {LightWallet} from "@/contracts/LightWallet.sol";
import {LightWalletFactory} from "@/contracts/LightWalletFactory.sol";
import {UniversalSigValidator} from "@/contracts/utils/UniversalSigValidator.sol";
import {Test} from "forge-std/Test.sol";

/// @notice Unit tests for `LightWallet`, organized by functions.
contract LightWalletTest is Test {
    // Initialzed Event from `Initializable.sol` https://github.com/OpenZeppelin/openzeppelin-contracts/blob/e50c24f5839db17f46991478384bfda14acfb830/contracts/proxy/utils/Initializable.sol#L73
    event Initialized(uint8 version);

    // EntryPoint from eth-inifinitism
    EntryPoint entryPoint;
    // LightWallet core contract
    LightWallet account;
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
        // Create the account using the factory w/ nonce 0
        account = factory.createAccount(address(this), 0);
    }

    function test_light_initialize() public {
        vm.expectEmit(true, true, true, true);
        emit Initialized(255);
        // Create a new account for the implementation
        account = new LightWallet(entryPoint);
    }

    function test_light_implementation_noInitialize() public {
        // Create a new account for the implementation
        account = new LightWallet(entryPoint);
        // Ensure that the account is not initializable on the implementation contract
        vm.expectRevert(bytes("Initializable: contract is already initialized"));
        account.initialize(address(this));
    }

    // Ref: https://eips.ethereum.org/EIPS/eip-1271
    // Ref: https://eips.ethereum.org/EIPS/eip-6492
    function test_light_eip1271_6492() public {
        // Create an EOA address of the owner
        address alice = vm.addr(1);
        // Create a LightWallet w/ the factory
        account = factory.createAccount(alice, uint256(0));
        // Obtain the signature w/ the EOA
        bytes32 hashed = keccak256("Signed by Alice");
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(1, hashed);
        bytes memory signature = abi.encodePacked(r, s, v);

        // Test the signature w/ EIP-1271
        assertEq(account.isValidSignature(hashed, signature), bytes4(0x1626ba7e));

        // Test the signature w/ EIP-6492
        assertEq(validator.isValidSigImpl(address(account), hashed, signature, false), true);
        assertEq(validator.isValidSigWithSideEffects(address(account), hashed, signature), true);
        assertEq(validator.isValidSig(address(account), hashed, signature), true);
    }
}
