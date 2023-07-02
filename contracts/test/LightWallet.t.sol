// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.18;

import {EntryPoint} from "@/contracts/core/EntryPoint.sol";
import {LightWallet, UserOperation} from "@/contracts/LightWallet.sol";
import {LightWalletFactory} from "@/contracts/LightWalletFactory.sol";
import {UniversalSigValidator} from "@/contracts/utils/UniversalSigValidator.sol";
import {ERC4337Utils} from "@/test/utils/ERC4337Utils.sol";
import {Test} from "forge-std/Test.sol";

// From: https://github.com/zerodevapp/kernel/blob/daae3e246f628645a0c52db48710f025ca723189/test/foundry/Kernel.test.sol#L16
using ERC4337Utils for EntryPoint;

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

    // Address of the owner of the account
    address user;
    // Private key of the owner of the account
    uint256 userKey;
    // Address of the beneficiary of the account
    address payable beneficiary;

    function setUp() public {
        // Deploy the EntryPoint
        entryPoint = new EntryPoint();
        // Deploy the LightWalletFactory w/ EntryPoint
        factory = new LightWalletFactory(entryPoint);
        // Deploy the UniversalSigValidator
        validator = new UniversalSigValidator();
        // Set the user and userKey
        (user, userKey) = makeAddrAndKey("user");
        // Create the account using the factory w/ nonce 0
        account = factory.createAccount(user, 0);
        // Set the beneficiary
        beneficiary = payable(address(makeAddr("beneficiary")));

        // Deposit 1e30 ETH into the account
        vm.deal(address(account), 1e30);
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

    function test_light_transfer_eth() public {
        // Example UserOperation to send 0 ETH to the address zero
        UserOperation memory op = entryPoint.fillUserOp(
            address(account), abi.encodeWithSelector(LightWallet.execute.selector, address(1), 1, bytes(""))
        );
        op.signature = abi.encodePacked(entryPoint.signUserOpHash(vm, userKey, op));
        UserOperation[] memory ops = new UserOperation[](1);
        ops[0] = op;
        entryPoint.handleOps(ops, beneficiary);

        assertEq(address(1).balance, 1);
    }

    // Ref: https://eips.ethereum.org/EIPS/eip-1271
    // Ref: https://eips.ethereum.org/EIPS/eip-6492
    function test_light_eip_1271_6492() public {
        // Obtain the signature w/ the EOA by the user
        bytes32 hashed = keccak256("Signed by user");
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(userKey, hashed);
        bytes memory signature = abi.encodePacked(r, s, v);

        // Test the signature w/ EIP-1271
        assertEq(account.isValidSignature(hashed, signature), bytes4(0x1626ba7e));

        // Test the signature w/ EIP-6492
        assertEq(validator.isValidSigImpl(address(account), hashed, signature, false), true);
        assertEq(validator.isValidSigWithSideEffects(address(account), hashed, signature), true);
        assertEq(validator.isValidSig(address(account), hashed, signature), true);
    }
}
