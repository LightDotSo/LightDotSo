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
import {LightWalletUtils} from "@/contracts/utils/LightWalletUtils.sol";
import {StorageUtils} from "@/test/utils/StorageUtils.sol";
import {ERC4337Utils} from "@/test/utils/ERC4337Utils.sol";
import {Test} from "forge-std/Test.sol";

// The structure of the base test is influenced by sabilier - https://github.com/sablier-labs/v2-core/blob/3df030516c7e9044742313c7cf17f15fdc1e9b05/test/Base.t.sol
// License: UNLICENSED

using ERC4337Utils for EntryPoint;

/// @notice BaseTest is a base contract for all tests
abstract contract BaseTest is Test {
    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    // Initialzed Event from `Initializable.sol` https://github.com/OpenZeppelin/openzeppelin-contracts/blob/e50c24f5839db17f46991478384bfda14acfb830/contracts/proxy/utils/Initializable.sol#L73
    event Initialized(uint8 version);

    // -------------------------------------------------------------------------
    // Constants
    // -------------------------------------------------------------------------

    // ERC6492 Detection Suffix
    bytes32 internal constant ERC6492_DETECTION_SUFFIX =
        0x6492649264926492649264926492649264926492649264926492649264926492;

    // -------------------------------------------------------------------------
    // Storages
    // -------------------------------------------------------------------------

    // Address of the owner of the account
    address internal user;
    // Private key of the owner of the account
    uint256 internal userKey;
    // Address of the beneficiary of the account
    address payable internal beneficiary;
    // Hash of the expected image
    bytes32 internal expectedImageHash;

    // -------------------------------------------------------------------------
    // Contracts
    // -------------------------------------------------------------------------

    // EntryPoint from eth-inifinitism
    EntryPoint internal entryPoint;
    // LightWallet core contract
    LightWallet internal account;
    // LightWalletFactory core contract
    LightWalletFactory internal factory;
    // UniversalSigValidator
    UniversalSigValidator internal validator;

    // -------------------------------------------------------------------------
    // Utility Contracts
    // -------------------------------------------------------------------------

    // Safe utility contract
    LightWalletUtils internal lightWalletUtils;
    // Storage utility contract
    StorageUtils internal storageUtils;

    // -------------------------------------------------------------------------
    // Setup
    // -------------------------------------------------------------------------

    function setUp() public virtual {
        // Deploy the EntryPoint
        entryPoint = new EntryPoint();
        // Deploy the LightWalletFactory w/ EntryPoint
        factory = new LightWalletFactory(entryPoint);
        // Deploy the UniversalSigValidator
        validator = new UniversalSigValidator();

        // Deploy the LightWalletUtils utility contract
        lightWalletUtils = new LightWalletUtils();
        // Deploy the StorageUtils utility contract
        storageUtils = new StorageUtils();

        // Set the user and userKey
        (user, userKey) = makeAddrAndKey("user");
        // Set the beneficiary
        beneficiary = payable(address(makeAddr("beneficiary")));
        // Get the expected image hash
        expectedImageHash = lightWalletUtils.getExpectedImageHash(user);
        // Create the account using the factory w/ nonce 0 and hash
        account = factory.createAccount(expectedImageHash, 0);

        // Deposit 1e30 ETH into the account
        vm.deal(address(account), 1e30);
    }
}
