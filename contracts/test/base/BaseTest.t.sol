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

// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.8.18;

import {EntryPoint} from "@/contracts/core/EntryPoint.sol";
import {LightWallet} from "@/contracts/LightWallet.sol";
import {LightWalletFactory} from "@/contracts/LightWalletFactory.sol";
import {UniversalSigValidator} from "@/contracts/utils/UniversalSigValidator.sol";
import {ERC4337Utils} from "@/test/utils/ERC4337Utils.sol";
import {LightWalletUtils} from "@/test/utils/LightWalletUtils.sol";
import {ProxyUtils} from "@/test/utils/ProxyUtils.sol";
import {StorageUtils} from "@/test/utils/StorageUtils.sol";
import {Test} from "forge-std/Test.sol";

// The structure of the base test is influenced by sabilier - https://github.com/sablier-labs/v2-core/blob/3df030516c7e9044742313c7cf17f15fdc1e9b05/test/Base.t.sol
// License: UNLICENSED

using ERC4337Utils for EntryPoint;

/// @notice BaseTest is a base contract for all tests
abstract contract BaseTest is Test {
    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    // Initialized Event from `LightWallet.sol`
    event LightWalletInitialized(address entrypoint, bytes32 imageHash);

    // Initialzed Event from `Initializable.sol` https://github.com/OpenZeppelin/openzeppelin-contracts/blob/e50c24f5839db17f46991478384bfda14acfb830/contracts/proxy/utils/Initializable.sol#L73
    event Initialized(uint8 version);

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

    // LightWallet for deployed account
    LightWallet internal wallet;

    // -------------------------------------------------------------------------
    // Utility Contracts
    // -------------------------------------------------------------------------

    // Safe utility contract
    LightWalletUtils internal lightWalletUtils;
    // Storage utility contract
    StorageUtils internal storageUtils;
    // UniversalSigValidator
    UniversalSigValidator internal validator;
    // Testing utility contract
    ProxyUtils proxyUtils;
    // -------------------------------------------------------------------------
    // Setup
    // -------------------------------------------------------------------------

    /// @dev BaseTest setup
    function setUp() public virtual {
        // Deploy the EntryPoint
        entryPoint = new EntryPoint();
        // Deploy the LightWalletFactory w/ EntryPoint
        factory = new LightWalletFactory(entryPoint);

        // Deploy the LightWalletUtils utility contract
        lightWalletUtils = new LightWalletUtils();
        // Deploy the StorageUtils utility contract
        storageUtils = new StorageUtils();
        // Deploy the UniversalSigValidator
        validator = new UniversalSigValidator();
        // Deploy the ProxyUtils utility contract
        proxyUtils = new ProxyUtils();
    }

    /// @dev Create the account using the factory w/ hash 1, nonce 0
    function _testCreateAccountWithNonceZero() internal {
        // Create the account using the factory w/ hash 1, nonce 0
        account = factory.createAccount(bytes32(uint256(1)), 0);
    }
}
