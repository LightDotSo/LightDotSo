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

import {PackedUserOperation} from "@eth-infinitism/account-abstraction/contracts/interfaces/PackedUserOperation.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import {MagicSpend} from "magic-spend/MagicSpend.sol";
import {Test} from "forge-std/Test.sol";
import {EntryPoint} from "@/contracts/core/EntryPoint.sol";
import {EntryPointSimulations} from "@/contracts/core/EntryPointSimulations.sol";
import {LightPaymaster} from "@/contracts/LightPaymaster.sol";
import {LightWalletFactory} from "@/contracts/LightWalletFactory.sol";
import {ImmutableProxy} from "@/contracts/proxies/ImmutableProxy.sol";
import {BaseTest} from "@/test/base/BaseTest.t.sol";
import {ERC4337Utils} from "@/test/utils/ERC4337Utils.sol";
import {LightWalletUtils} from "@/test/utils/LightWalletUtils.sol";

using ERC4337Utils for EntryPoint;

/// @notice Base integration test for `LightWallet`
abstract contract BaseIntegrationTest is BaseTest {
    // -------------------------------------------------------------------------
    // Storages
    // -------------------------------------------------------------------------

    // Address of the owner of the account
    address internal user;
    // Private key of the owner of the account
    uint256 internal userKey;
    // Address of the beneficiary of the account
    address payable internal beneficiary;

    // Address of the light protocol controller
    address internal lightProtocolController;

    // Address of the LightPaymaster owner
    address internal lightPaymasterOwner;
    // Address of the LightPaymaster signer
    address internal lightPaymasterSigner;
    // Private key of the LightPaymaster signer
    uint256 internal lightPaymasterSignerKey;

    // -------------------------------------------------------------------------
    // Utility Contracts
    // -------------------------------------------------------------------------

    // ImmutableProxy contract
    ImmutableProxy immutableProxy;

    // -------------------------------------------------------------------------
    // Setup
    // -------------------------------------------------------------------------

    /// @dev Base integration test setup
    function setUp() public virtual override {
        // Base test setup
        BaseTest.setUp();

        // Deploy the entrypoint simulation contract
        entryPointSimulations = new EntryPointSimulations();

        // Deploy the immutable proxy
        immutableProxy = new ImmutableProxy();

        // Set the user and userKey
        (user, userKey) = makeAddrAndKey("user");
        // Set the beneficiary
        beneficiary = payable(address(makeAddr("beneficiary")));

        // Set the light protocol controller
        lightProtocolController = address(makeAddr("lightProtocolController"));
        // Set the light paymaster owner
        lightPaymasterOwner = address(makeAddr("lightPaymasterOwner"));
        // Set the light paymaster signer
        lightPaymasterSigner = address(makeAddr("lightPaymasterSigner"));

        // Get the expected image hash
        expectedImageHash = LightWalletUtils.getExpectedImageHash(user, weight, threshold, checkpoint);

        // Create the account using the factory w/ nonce and hash
        account = factory.createAccount(expectedImageHash, nonce);
        // Create the timelock controller
        timelock = timelockFactory.createTimelockController(address(account), bytes32(uint256(1)));

        // Deploy the LightPaymaster
        address paymasterImplementation = address(new LightPaymaster(address(entryPoint)));
        paymaster = LightPaymaster(
            payable(
                new ERC1967Proxy{salt: bytes32(0)}(
                    address(paymasterImplementation),
                    abi.encodeCall(MagicSpend.initialize, (lightPaymasterOwner, 300, lightPaymasterSigner))
                )
            )
        );

        // Deposit 1e30 ETH into the account
        vm.deal(address(account), 1e30);
    }

    // -------------------------------------------------------------------------
    // Internal
    // -------------------------------------------------------------------------

    /// @dev Upgrade the account to the new implementation and assert that the implementation is correct
    function _upgradeToUUPS(address _proxy, address _newImplementation) internal {
        // Upgrade the account to the new implementation
        _upgradeTo(_proxy, address(_newImplementation));
        // Assert that the account is now the new version
        assertEq(getProxyImplementation(address(_proxy)), address(_newImplementation));
    }

    /// @dev Upgrade the account to the immutable version and assert that the implementation is correct
    function _upgradeToImmutable(address _proxy) internal {
        // Upgrade the account to the immutable version
        _upgradeTo(_proxy, address(immutableProxy));
        // Assert that the account is now immutable
        assertEq(getProxyImplementation(address(_proxy)), address(immutableProxy));
        // Assert that the account cannot be upgraded again
        vm.expectRevert("Upgrades are disabled");
        _upgradeTo(_proxy, address(0));
    }

    /// @dev Just the plain upgradeTo function from UUPSUpgradeable
    function _upgradeTo(address _proxy, address _newImplementation) internal {
        // Upgrade the account to the new implementation
        UUPSUpgradeable(_proxy).upgradeToAndCall(address(_newImplementation), bytes(""));
    }

    /// @dev Assert that the proxy admin is the zero address
    function _noProxyAdmin(address _proxy) internal view {
        // Assert that the proxy admin is the zero address
        assertEq(getProxyAdmin(_proxy), address(0));
    }

    /// @dev Check that the account is not initializable twice
    // Why Initialize is required: https://stackoverflow.com/questions/72475214/solidity-why-use-initialize-function-instead-of-constructor
    function _noInitializeTwice(address _proxy, bytes memory _calldata) internal {
        vm.expectRevert(Initializable.InvalidInitialization.selector);
        // Check that the account is initializable
        (bool success,) = _proxy.call(_calldata);
        // Assert that the code was not reverted
        assertEq(success, true);
    }

    /// Utility function to create an account from the entry point
    function _testCreateAccountFromEntryPoint() internal {
        PackedUserOperation[] memory ops = _testSignPackUserOpWithInitCode();
        entryPoint.handleOps(ops, beneficiary);
    }

    /// Utility function to run the signPackUserOp function
    function _testSignPackUserOpWithInitCode() internal view returns (PackedUserOperation[] memory ops) {
        // Set the initCode to create an account with the expected image hash and nonce
        bytes memory initCode = abi.encodePacked(
            address(factory),
            abi.encodeWithSelector(LightWalletFactory.createAccount.selector, expectedImageHash, nonce)
        );

        // Example UserOperation to create the account
        ops = entryPoint.signPackUserOps(vm, address(wallet), "", userKey, initCode, weight, threshold, checkpoint);
    }
}
