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
import {SafeUtils} from "@/contracts/samples/SafeUtils.sol";
import {StorageUtils} from "@/test/utils/StorageUtils.sol";
import {ERC4337Utils} from "@/test/utils/ERC4337Utils.sol";
import {Test} from "forge-std/Test.sol";

using ERC4337Utils for EntryPoint;

contract BaseTest is Test {
    // Initialzed Event from `Initializable.sol` https://github.com/OpenZeppelin/openzeppelin-contracts/blob/e50c24f5839db17f46991478384bfda14acfb830/contracts/proxy/utils/Initializable.sol#L73
    event Initialized(uint8 version);

    // ERC6492 Detection Suffix
    bytes32 internal constant ERC6492_DETECTION_SUFFIX =
        0x6492649264926492649264926492649264926492649264926492649264926492;

    // EntryPoint from eth-inifinitism
    EntryPoint internal entryPoint;
    // LightWallet core contract
    LightWallet internal account;
    // LightWalletFactory core contract
    LightWalletFactory internal factory;
    // UniversalSigValidator
    UniversalSigValidator internal validator;

    // Safe utility contract
    SafeUtils internal safeUtils;
    // Storage utility contract
    StorageUtils internal storageUtils;

    // Address of the owner of the account
    address internal user;
    // Private key of the owner of the account
    uint256 internal userKey;
    // Address of the beneficiary of the account
    address payable internal beneficiary;

    function _setUpBase() internal {
        // Deploy the EntryPoint
        entryPoint = new EntryPoint();
        // Deploy the LightWalletFactory w/ EntryPoint
        factory = new LightWalletFactory(entryPoint);
        // Deploy the UniversalSigValidator
        validator = new UniversalSigValidator();
        // Set the user and userKey
        (user, userKey) = makeAddrAndKey("user");
        // Create the account using the factory w/ hash 1, nonce 0
        account = factory.createAccount(bytes32(uint256(1)), 0);
        // Set the beneficiary
        beneficiary = payable(address(makeAddr("beneficiary")));

        // Deploy the SafeUtils utility contract
        safeUtils = new SafeUtils();
        // Deploy the StorageUtils utility contract
        storageUtils = new StorageUtils();

        // Deposit 1e30 ETH into the account
        vm.deal(address(account), 1e30);
    }
}
