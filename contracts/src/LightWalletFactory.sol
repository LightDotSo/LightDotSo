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

// LightWallet.sol -- LightWallet initial implementation
// Modified implementation on SimpleAccountFactory.sol from @eth-infinitism/account-abstraction
// Link: https://github.com/eth-infinitism/account-abstraction/blob/develop/contracts/samples/SimpleAccountFactory.sol
// License: GPL-3.0

import {Create2} from "@openzeppelin/contracts/utils/Create2.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {IEntryPoint} from "@eth-infinitism/account-abstraction/contracts/interfaces/IEntryPoint.sol";
import {LightWallet} from "@/contracts/LightWallet.sol";
import {ILightWalletFactory} from "@/contracts/interfaces/ILightWalletFactory.sol";

/// @title LightWalletFactory
/// @author @shunkakinoki
/// @notice A factory contract for `LightWallet`
/// @dev A UserOperations "initCode" holds the address of the factory, and a method call (to createAccount, in this sample factory).
/// The factory's createAccount returns the target account address even if it is already installed.
/// This way, the entryPoint.getSenderAddress() can be called either before or after the account is created.
contract LightWalletFactory is ILightWalletFactory {
    // -------------------------------------------------------------------------
    // Constant
    // -------------------------------------------------------------------------

    /// @notice The name for this contract
    string public constant NAME = "LightWalletFactory";

    /// @notice The version for this contract
    string public constant VERSION = "0.3.0";

    // -------------------------------------------------------------------------
    // Immutable Storage
    // -------------------------------------------------------------------------

    LightWallet public immutable accountImplementation;

    // -------------------------------------------------------------------------
    // Constructor + Functions
    // -------------------------------------------------------------------------

    constructor(IEntryPoint entryPoint) {
        if (address(entryPoint) == address(0)) revert EntrypointAddressZero();
        accountImplementation = new LightWallet(entryPoint);
    }

    /// @notice Creates an account, and return its address.
    /// @param hash The hash of the account image.
    /// @param salt The salt of the create2 call.
    /// @dev Note that during UserOperation execution, this method is called only if the account is not deployed.
    /// This method returns an existing account address so that entryPoint.getSenderAddress() would work even after account creation
    function createAccount(bytes32 hash, bytes32 salt) public returns (LightWallet ret) {
        address addr = getAddress(hash, salt);
        uint256 codeSize = addr.code.length;
        // If the account already exists, return it
        if (codeSize > 0) {
            return LightWallet(payable(addr));
        }
        // Initializes the account
        ret = LightWallet(
            payable(
                new ERC1967Proxy{salt: bytes32(salt)}(
                    address(accountImplementation), abi.encodeCall(LightWallet.initialize, (hash))
                )
            )
        );
    }

    /// @notice calculate the counterfactual address of this account as it would be returned by createAccount()
    /// @param hash The hash of the account image.
    /// @param salt The salt of the create2 call.
    // slither-disable-next-line too-many-digits
    function getAddress(bytes32 hash, bytes32 salt) public view returns (address) {
        // Computes the address with the given `salt`and the contract address `accountImplementation`, and with `initialize` method w/ `hash`
        return Create2.computeAddress(
            salt,
            keccak256(
                abi.encodePacked(
                    type(ERC1967Proxy).creationCode,
                    abi.encode(address(accountImplementation), abi.encodeCall(LightWallet.initialize, (hash)))
                )
            )
        );
    }
}
