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

// SimpleAccountV2.sol -- SimpleAccountV2 initial implementation
// Modified implementation on SimpleAccountFactory.sol from @eth-infinitism/account-abstraction
// Link: https://github.com/eth-infinitism/account-abstraction/blob/develop/contracts/samples/SimpleAccountFactory.sol
// License: GPL-3.0

import {Create2} from "@openzeppelin/contracts/utils/Create2.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {IEntryPoint} from "@eth-infinitism/account-abstraction/contracts/interfaces/IEntryPoint.sol";
import {SimpleAccountV2} from "@/contracts/samples/SimpleAccountV2.sol";

/// @title SimpleAccountV2Factory
/// @author shunkakinoki
/// @notice A factory contract for `SimpleAccountV2`
/// @dev A UserOperations "initCode" holds the address of the factory, and a method call (to createAccount, in this sample factory).
/// The factory's createAccount returns the target account address even if it is already installed.
/// This way, the entryPoint.getSenderAddress() can be called either before or after the account is created.
contract SimpleAccountV2Factory {
    SimpleAccountV2 public immutable accountImplementation;

    constructor(IEntryPoint _entryPoint) {
        accountImplementation = new SimpleAccountV2(_entryPoint);
    }

    /// @notice Creates an account, and return its address.
    /// @dev Note that during UserOperation execution, this method is called only if the account is not deployed.
    /// This method returns an existing account address so that entryPoint.getSenderAddress() would work even after account creation
    function createAccount(address owner, uint256 salt) public returns (SimpleAccountV2 ret) {
        address addr = getAddress(owner, salt);
        uint256 codeSize = addr.code.length;
        // If the account already exists, return it
        if (codeSize > 0) {
            return SimpleAccountV2(payable(addr));
        }
        // Initializes the account
        ret = SimpleAccountV2(
            payable(
                new ERC1967Proxy{salt : bytes32(salt)}(
                  address(accountImplementation),
                  abi.encodeCall(SimpleAccountV2.initialize, (owner))
                )
            )
        );
    }

    /// @notice calculate the counterfactual address of this account as it would be returned by createAccount()
    function getAddress(address owner, uint256 salt) public view returns (address) {
        // Computes the address with the given `salt`and the contract address `addressImplementation`, and with `initialize` method w/ `owner`
        return Create2.computeAddress(
            bytes32(salt),
            keccak256(
                abi.encodePacked(
                    type(ERC1967Proxy).creationCode,
                    abi.encode(address(accountImplementation), abi.encodeCall(SimpleAccountV2.initialize, (owner)))
                )
            )
        );
    }
}
