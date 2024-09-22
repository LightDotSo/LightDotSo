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

import {byteCode, salt} from "@/bytecodes/Entrypoint/v0.7.0.b.sol";
import {CREATE2_DEPLOYER_ADDRESS} from "@/constants/addresses.sol";
import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import {EntryPoint} from "@/contracts/core/EntryPoint.sol";
import {LightPaymaster} from "@/contracts/LightPaymaster.sol";
import {LightTimelockController} from "@/contracts/LightTimelockController.sol";
import {LightTimelockControllerFactory} from "@/contracts/LightTimelockControllerFactory.sol";
import {LightWallet} from "@/contracts/LightWallet.sol";
import {LightWalletFactory} from "@/contracts/LightWalletFactory.sol";
import {SimpleAccountFactory} from "@/contracts/samples/SimpleAccountFactory.sol";
import {UniversalSigValidator} from "@/contracts/utils/UniversalSigValidator.sol";
import {ERC4337Utils} from "@/test/utils/ERC4337Utils.sol";
import {Test} from "forge-std/Test.sol";

// The structure of the base test is influenced by sabilier - https://github.com/sablier-labs/v2-core/blob/3df030516c7e9044742313c7cf17f15fdc1e9b05/test/Base.t.sol
// License: UNLICENSED

using ERC4337Utils for EntryPoint;

interface ICREATE2Deployer {
    function deploy(uint256 salt, bytes calldata initializationCode)
        external
        returns (address payable deploymentAddress);
}

/// @notice BaseTest is a base contract for all tests
abstract contract BaseTest is Test {
    // -------------------------------------------------------------------------
    // Contracts
    // -------------------------------------------------------------------------

    ICREATE2Deployer constant CREATE2_DEPLOYER = ICREATE2Deployer(CREATE2_DEPLOYER_ADDRESS);

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    // Initialized Event from `LightWallet.sol`
    event LightWalletInitialized(address entrypoint, bytes32 imageHash);

    // Initialzed Event from `Initializable.sol` https://github.com/OpenZeppelin/openzeppelin-contracts/blob/3e6c86392c97fbc30d3d20a378a6f58beba08eba/contracts/proxy/utils/Initializable.sol#L92
    event Initialized(uint64 version);

    // ImageHashUpdated Event from `IModuleAuth.sol` https://github.com/0xsequence/wallet-contracts/blob/e0c5382636a88b4db4bcf0a70623355d7cd30fb4/contracts/modules/commons/interfaces/IModuleAuth.sol#L9
    event ImageHashUpdated(bytes32 imageHash);

    // Upgraded Event from `ERC1967Upgrade.sol` https://github.com/OpenZeppelin/openzeppelin-contracts/blob/d00acef4059807535af0bd0dd0ddf619747a044b/contracts/proxy/ERC1967/ERC1967Upgrade.sol#L33
    event Upgraded(address implementation);

    // -------------------------------------------------------------------------
    // Constants
    // -------------------------------------------------------------------------

    // ERC6492 Detection Suffix
    bytes32 internal constant ERC6492_DETECTION_SUFFIX =
        0x6492649264926492649264926492649264926492649264926492649264926492;

    // -------------------------------------------------------------------------
    // Contracts
    // -------------------------------------------------------------------------

    // EntryPoint from eth-inifinitism
    EntryPoint internal entryPoint;
    // LightWallet core contract
    LightWallet internal account;
    // LightWalletFactory core contract
    LightWalletFactory internal factory;
    // LightPaymaster core contract
    LightPaymaster internal paymaster;
    // LightWallet for deployed account
    LightWallet internal wallet;
    // LightTimelockController core contract
    LightTimelockController internal timelock;
    // LightTimelockControllerFactory core contract
    LightTimelockControllerFactory internal timelockFactory;

    // SimpleAccountFactory core contract
    SimpleAccountFactory internal simpleAccountFactory;

    // -------------------------------------------------------------------------
    // Utility Contracts
    // -------------------------------------------------------------------------

    // UniversalSigValidator
    UniversalSigValidator internal validator;

    // -------------------------------------------------------------------------
    // Utility Storages
    // -------------------------------------------------------------------------

    bytes32 internal expectedImageHash;

    uint8 internal weight = uint8(1);
    uint16 internal threshold = uint16(1);
    uint32 internal checkpoint = uint32(1);

    bytes32 internal nonce = bytes32(uint256(1));

    // -------------------------------------------------------------------------
    // Setup
    // -------------------------------------------------------------------------

    /// @dev BaseTest setup
    function setUp() public virtual {
        // Deploy the EntryPoint
        entryPoint = new EntryPoint();

        // Deploy the LightWalletFactory w/ EntryPoint
        factory = new LightWalletFactory(entryPoint);

        // Deploy the UniversalSigValidator
        validator = new UniversalSigValidator();

        // Deploy the LightTimelockControllerFactory
        timelockFactory = new LightTimelockControllerFactory();
    }

    /// @dev Create the account using the factory w/ hash 1, nonce 0
    function _testCreateAccountWithNonceZero() internal {
        // Create the account using the factory w/ hash 1, nonce 0
        account = factory.createAccount(bytes32(uint256(1)), 0);
    }

    // -------------------------------------------------------------------------
    // Utility
    // -------------------------------------------------------------------------

    // From: https://github.com/SoulWallet/soulwallet-core/blob/7aac4a0a4d0f1054fd75d1ca09775c873b6bddab/test/dev/deployEntryPoint.sol#L2
    // License: GPL-3.0
    /// @dev Deploys a contract using create2
    /// @param _initCode The bytecode of the contract to deploy
    /// @param _salt The salt for the create2 call
    function deployWithCreate2(bytes memory _initCode, bytes32 _salt) public payable returns (address) {
        bytes memory deployCode = abi.encodePacked(_salt, _initCode);

        address contractAddress;
        assembly {
            mstore(0x00, 0)
            let result := call(gas(), CREATE2_DEPLOYER_ADDRESS, 0, add(deployCode, 0x20), mload(deployCode), 12, 20)
            if iszero(result) { revert(0, 0) }
            contractAddress := mload(0)
        }

        return contractAddress;
    }

    function deployEntryPoint() internal {
        entryPoint = EntryPoint(payable(deployWithCreate2(abi.encodePacked(byteCode), salt)));
    }

    /// @dev Gets the pseudo-random number
    function randomSeed() internal view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao))) % 4337;
    }

    /// @dev Gets the pseudo-random salt in bytes32
    function randomNonce() internal view returns (bytes32) {
        return bytes32(randomSeed());
    }

    /// @param _addr The address of the contract
    /// @param _slot The location of the bytes32 in storage
    /// @dev Reads a uint256 from storage
    function readBytes32(address _addr, bytes32 _slot) internal view returns (bytes32 val) {
        bytes32 storageSlot = vm.load(_addr, _slot);
        assembly {
            mstore(0, storageSlot)
            val := mload(0)
        }
    }

    /// @param _proxyAddress The address of the proxy
    /// @dev Gets the implementation address of a proxy
    function getProxyImplementation(address _proxyAddress) internal view returns (address addr) {
        bytes32 implSlot = bytes32(uint256(keccak256("eip1967.proxy.implementation")) - 1);
        bytes32 proxySlot = vm.load(_proxyAddress, implSlot);
        assembly {
            mstore(0, proxySlot)
            addr := mload(0)
        }
    }

    /// @param _proxyAddress The address of the proxy
    /// @dev Gets the admin address of a proxy
    function getProxyAdmin(address _proxyAddress) internal view returns (address addr) {
        bytes32 adminSlot = bytes32(uint256(keccak256("eip1967.proxy.admin")) - 1);
        bytes32 proxySlot = vm.load(_proxyAddress, adminSlot);
        assembly {
            mstore(0, proxySlot)
            addr := mload(0)
        }
    }

    /// @param _proxyAddress The address of the proxy
    /// @dev Gets the creation code of a proxy
    function getCreationCode(address _proxyAddress) internal view returns (bytes memory) {
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
