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

// SafeL3.sol -- SafeL3 initial implementation
// Modified implementation on SimpleAccount.sol from @eth-infinitism/account-abstraction
// Link: https://github.com/eth-infinitism/account-abstraction/blob/develop/contracts/samples/SimpleAccount.sol
// License: GPL-3.0

import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import {BaseAccount} from "@eth-infinitism/account-abstraction/contracts/core/BaseAccount.sol";
import {IEntryPoint} from "@eth-infinitism/account-abstraction/contracts/interfaces/IEntryPoint.sol";
import {UserOperation} from "@eth-infinitism/account-abstraction/contracts/interfaces/UserOperation.sol";
import {TokenCallbackHandler} from
    "@eth-infinitism/account-abstraction/contracts/samples/callback/TokenCallbackHandler.sol";
import {ModuleAuth} from "@0xsequence/wallet-contracts/contracts/modules/commons/ModuleAuth.sol";
import {ModuleAuthUpgradable} from "@0xsequence/wallet-contracts/contracts/modules/commons/ModuleAuthUpgradable.sol";
import {SafeInterface} from "@/contracts/samples/SafeInterface.sol";

/// @title SafeL3
/// @author shunkakinoki
/// @notice SafeL3 is a composable account abstraction contract
contract SafeL3 is
    SafeInterface,
    ModuleAuthUpgradable,
    BaseAccount,
    TokenCallbackHandler,
    UUPSUpgradeable,
    Initializable
{
    // -------------------------------------------------------------------------
    // Constants
    // -------------------------------------------------------------------------

    /// @notice The ERC1271 compatibility magic value
    /// @dev See https://eips.ethereum.org/EIPS/eip-1271 for more information
    bytes4 private constant ERC1271_SUCCESS = 0x1626ba7e;

    // -------------------------------------------------------------------------
    // Immutable Storage
    // -------------------------------------------------------------------------

    /// @notice The entry point contract for this account
    IEntryPoint private immutable _entryPoint;

    // -------------------------------------------------------------------------
    // Constructor + Functions
    // -------------------------------------------------------------------------

    /// @inheritdoc BaseAccount
    function entryPoint() public view virtual override(BaseAccount, SafeInterface) returns (IEntryPoint) {
        return _entryPoint;
    }

    // solhint-disable-next-line no-empty-blocks
    receive() external payable {}

    /// @param anEntryPoint The address of the entrypoint contract.
    /// @dev Should be set to the address of the EntryPoint contract
    /// The official EntryPoint contract is at https://etherscan.io/address/0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789
    constructor(IEntryPoint anEntryPoint) {
        _entryPoint = anEntryPoint;
        _disableInitializers();
    }

    /// @param dest The address of the target contract to call.
    /// @param func The calldata to send to the target contract.
    /// @notice Executes a transaction (called directly by entryPoint)
    function execute(address dest, uint256 value, bytes calldata func) external {
        _requireFromEntryPoint();
        _call(dest, value, func);
    }

    /// @param dest The array of address of the target contract to call.
    /// @param func The array of calldata to send to the target contract.
    /// @notice Executes a sequence of transactions (called directly by entryPoint)
    function executeBatch(address[] calldata dest, bytes[] calldata func) external {
        _requireFromEntryPoint();
        require(dest.length == func.length, "wrong array lengths");
        for (uint256 i = 0; i < dest.length; i++) {
            _call(dest[i], 0, func[i]);
        }
    }
    /// @inheritdoc ModuleAuth

    function isValidSignature(bytes32 _hash, bytes calldata _signatures)
        public
        view
        override(SafeInterface, ModuleAuth)
        returns (bytes4)
    {
        return super.isValidSignature(_hash, _signatures);
    }

    /// @param _imageHash The hash to validate the signature against.
    /// @notice The _entryPoint member is immutable, to reduce gas consumption.  To upgrade EntryPoint,
    /// a new implementation of SimpleAccount must be deployed with the new EntryPoint address, then upgrading
    /// the implementation by calling `upgradeTo()`
    function initialize(bytes32 _imageHash) public virtual initializer {
        _initialize(_imageHash);
    }

    // -------------------------------------------------------------------------
    // Entry Point
    // -------------------------------------------------------------------------

    /// @param _imageHash The hash to validate the signature against.
    /// @notice Emits an event for the initialization of the contract
    function _initialize(bytes32 _imageHash) internal virtual {
        _updateImageHash(_imageHash);
        emit SafeL3Initialized(_entryPoint, _imageHash);
    }

    /// @inheritdoc BaseAccount
    function _validateSignature(UserOperation calldata userOp, bytes32 userOpHash)
        internal
        virtual
        override
        returns (uint256 validationData)
    {
        (bool isValid,) = _signatureValidation(userOpHash, userOp.signature);
        if (!isValid) {
            return SIG_VALIDATION_FAILED;
        }
        return 0;
    }

    /// @notice Executes a call to a target contract with specified value and data.
    /// @param target The address of the target contract to call.
    /// @param value The amount of Wei (ETH) to send along with the call.
    /// @param data The data payload to send along with the call.
    /// @dev This internal function uses the `call` function to make an external call to the target contract
    /// with the specified value and data. It captures the success status and returned data of the call.
    /// If the call is not successful, it reverts the transaction and provides the error message from the target contract.
    function _call(address target, uint256 value, bytes memory data) internal {
        (bool success, bytes memory result) = target.call{value: value}(data);
        if (!success) {
            assembly {
                revert(add(result, 32), mload(result))
            }
        }
    }

    // -------------------------------------------------------------------------
    // Entry Point
    // -------------------------------------------------------------------------

    /// @notice check current account deposit in the entryPoint
    function getDeposit() public view returns (uint256) {
        return entryPoint().balanceOf(address(this));
    }

    /// @notice deposit more funds for this account in the entryPoint
    function addDeposit() public payable {
        entryPoint().depositTo{value: msg.value}(address(this));
    }

    /// @notice Withdraws value from the account's deposit
    /// @param withdrawAddress target to send to
    /// @param amount to withdraw
    function withdrawDepositTo(address payable withdrawAddress, uint256 amount) public onlySelf {
        entryPoint().withdrawTo(withdrawAddress, amount);
    }

    // -------------------------------------------------------------------------
    // Upgrades
    // -------------------------------------------------------------------------

    /// @dev Only callable by the current contract
    /// @inheritdoc UUPSUpgradeable
    function _authorizeUpgrade(address newImplementation) internal view override onlySelf {
        (newImplementation);
    }

    // -------------------------------------------------------------------------
    // Compatibility
    // -------------------------------------------------------------------------

    /// @inheritdoc ModuleAuthUpgradable
    function supportsInterface(bytes4 interfaceId)
        public
        pure
        override(SafeInterface, TokenCallbackHandler, ModuleAuthUpgradable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
