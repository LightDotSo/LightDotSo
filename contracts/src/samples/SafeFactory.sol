// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.8.18;

// SafeL3.sol -- SafeL3 initial implementation
// Modified implementation on SimpleAccountFactory.sol from @eth-infinitism/account-abstraction
// Link: https://github.com/eth-infinitism/account-abstraction/blob/develop/contracts/samples/SimpleAccountFactory.sol
// License: AGPL-3.0-or-later

import {Create2} from "@openzeppelin/contracts/utils/Create2.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {IEntryPoint} from "@eth-infinitism/account-abstraction/contracts/interfaces/IEntryPoint.sol";
import {SafeL3} from "@/contracts/samples/SafeL3.sol";

/// @title SafeFactory
/// @author shunkakinoki
/// @notice A factory contract for `SafeL3`
/// @dev A UserOperations "initCode" holds the address of the factory, and a method call (to createAccount, in this sample factory).
/// The factory's createAccount returns the target account address even if it is already installed.
/// This way, the entryPoint.getSenderAddress() can be called either before or after the account is created.
contract SafeFactory {
    SafeL3 public immutable accountImplementation;

    constructor(IEntryPoint _entryPoint) {
        accountImplementation = new SafeL3(_entryPoint);
    }

    /// @notice Creates an account, and return its address.
    /// @dev Note that during UserOperation execution, this method is called only if the account is not deployed.
    /// This method returns an existing account address so that entryPoint.getSenderAddress() would work even after account creation
    function createAccount(bytes32 hash, uint256 salt) public returns (SafeL3 ret) {
        address addr = getAddress(hash, salt);
        uint256 codeSize = addr.code.length;
        // If the account already exists, return it
        if (codeSize > 0) {
            return SafeL3(payable(addr));
        }
        // Initializes the account
        ret = SafeL3(
            payable(
                new ERC1967Proxy{salt : bytes32(salt)}(
                  address(accountImplementation),
                  abi.encodeCall(SafeL3.initialize, (hash))
                )
            )
        );
    }

    /// @notice calculate the counterfactual address of this account as it would be returned by createAccount()
    function getAddress(bytes32 hash, uint256 salt) public view returns (address) {
        // Computes the address with the given `salt`and the contract address `addressImplementation`, and with `initialize` method w/ `owner`
        return Create2.computeAddress(
            bytes32(salt),
            keccak256(
                abi.encodePacked(
                    type(ERC1967Proxy).creationCode,
                    abi.encode(address(accountImplementation), abi.encodeCall(SafeL3.initialize, (hash)))
                )
            )
        );
    }
}
