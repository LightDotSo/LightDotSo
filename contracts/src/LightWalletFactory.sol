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
    string public constant VERSION = "0.1.0";

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
                new ERC1967Proxy{salt : bytes32(salt)}(
                  address(accountImplementation),
                  abi.encodeCall(LightWallet.initialize, (hash))
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
