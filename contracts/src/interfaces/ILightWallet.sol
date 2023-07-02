// SPDX-License-Identifier: GPL-3.0

// Interface for IERC1271
// From: https://eips.ethereum.org/EIPS/eip-1271
// License: CC-BY-SA-4.0

pragma solidity ^0.8.18;

import {IEntryPoint} from "@eth-infinitism/account-abstraction/contracts/interfaces/IEntryPoint.sol";
import {UserOperation} from "@eth-infinitism/account-abstraction/contracts/interfaces/UserOperation.sol";
import {IERC1271} from "@/contracts/interfaces/IERC1271.sol";

interface ILightWallet is IERC1271 {
    // -------------------------------------------------------------------------
    // Errors
    // -------------------------------------------------------------------------

    /// @notice Emitted when the action is invoked not by an owner.
    error OnlyOwner();

    // -------------------------------------------------------------------------
    // Actions
    // -------------------------------------------------------------------------

    /// @notice Check if the caller is the owner.
    function owner() external view returns (address);

    /// @notice Check current account deposit in the entryPoint.
    function getDeposit() external view returns (uint256);

    /// @notice Deposit more funds for this account in the entryPoint.
    function addDeposit() external payable;

    /// @notice Executes a transaction (called directly from owner, or by entryPoint).
    function execute(address dest, uint256 value, bytes calldata func) external;

    /// @notice Executes a sequence of transactions (called directly from owner, or by entryPoint).
    function executeBatch(address[] calldata dest, bytes[] calldata func) external;

    /// @notice Check if a signature is valid based on the owner's address.
    /// Compatible with ERC1271
    function isValidSignature(bytes32 hash, bytes calldata signature) external view returns (bytes4 magicValue);

    /// @notice Sets the owner of this account, and emits an event.
    function initialize(address anOwner) external;

    /// @notice Withdraws value from the account's deposit.
    function withdrawDepositTo(address payable withdrawAddress, uint256 amount) external;

    /// @notice Returns the entry point contract address for this account.
    function entryPoint() external view returns (IEntryPoint);
}
