// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.20;

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

    // ERC6492 Detection Suffix
    bytes32 private constant ERC6492_DETECTION_SUFFIX =
        0x6492649264926492649264926492649264926492649264926492649264926492;

    // EntryPoint from eth-inifinitism
    EntryPoint private entryPoint;
    // LightWallet core contract
    LightWallet private account;
    // LightWalletFactory core contract
    LightWalletFactory private factory;
    // UniversalSigValidator
    UniversalSigValidator private validator;

    // Address of the owner of the account
    address private user;
    // Private key of the owner of the account
    uint256 private userKey;
    // Address of the beneficiary of the account
    address payable private beneficiary;

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

    // Tests that the account is initialized properly
    function test_light_initialize() public {
        vm.expectEmit(true, true, true, true);
        emit Initialized(255);
        // Create a new account for the implementation
        account = new LightWallet(entryPoint);
    }

    // Tests that the account can not be initialized twice
    function test_light_implementation_noInitialize() public {
        // Create a new account for the implementation
        account = new LightWallet(entryPoint);
        // Ensure that the account is not initializable on the implementation contract
        vm.expectRevert(bytes("Initializable: contract is already initialized"));
        account.initialize(address(this));
    }

    // Tests that the account can correctly transfer ETH
    function test_light_transfer_eth() public {
        // Example UserOperation to send 0 ETH to the address one
        UserOperation memory op = entryPoint.fillUserOp(
            address(account), abi.encodeWithSelector(LightWallet.execute.selector, address(1), 1, bytes(""))
        );
        op.signature = abi.encodePacked(entryPoint.signUserOpHash(vm, userKey, op));
        UserOperation[] memory ops = new UserOperation[](1);
        ops[0] = op;
        entryPoint.handleOps(ops, beneficiary);
        // Assert that the balance of the account is 1
        assertEq(address(1).balance, 1);
        // Assert the balance of the account is the Deposit - Gas
        assertEq(address(entryPoint).balance, 1_002_500_000_000 - 159_325);
    }

    // Tests that the account complies w/ EIP-1271 and EIP-6492
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

    // Tests that a predeployed contract complies w/ EIP-6492
    function test_light_predeployed_6492() public {
        // Obtain the original signature w/ the EOA by the user
        bytes32 hashed = keccak256("Signed by user");
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(userKey, hashed);
        bytes memory signature = abi.encodePacked(r, s, v);

        // Concat the signature w/ the EIP-6492 detection suffix because of the predeployed contract
        // concat(abi.encode((create2Factory, factoryCalldata, originalERC1271Signature), (address, bytes, bytes)), magicBytes)
        bytes memory sig_6492 = abi.encodePacked(
            abi.encode(
                // Nonce is 1 (does not exist)
                address(factory),
                abi.encodeWithSelector(LightWalletFactory.createAccount.selector, user, 1),
                signature
            ),
            ERC6492_DETECTION_SUFFIX
        );

        // Test the signature w/ EIP-6492
        assertEq(validator.isValidSigImpl(address(account), hashed, sig_6492, false), true);
        assertEq(validator.isValidSigWithSideEffects(address(account), hashed, sig_6492), true);
        assertEq(validator.isValidSig(address(account), hashed, sig_6492), true);
    }
}
