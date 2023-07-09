// SPDX-License-Identifier: AGPL-3.0-or-later

// Interface for IERC1271
// From: https://eips.ethereum.org/EIPS/eip-1271
// License: CC-BY-SA-4.0

pragma solidity ^0.8.18;

import {IEntryPoint} from "@eth-infinitism/account-abstraction/contracts/interfaces/IEntryPoint.sol";
import {UserOperation} from "@eth-infinitism/account-abstraction/contracts/interfaces/UserOperation.sol";
import {IERC1271} from "@/contracts/interfaces/IERC1271.sol";

interface SafeInterface is IERC1271 {
    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    event SafeL3Initialized(IEntryPoint indexed entryPoint, bytes32 indexed has);

    // -------------------------------------------------------------------------
    // Actions
    // -------------------------------------------------------------------------

    /// @notice Check current account deposit in the entryPoint.
    function getDeposit() external view returns (uint256);

    /// @notice Deposit more funds for this account in the entryPoint.
    function addDeposit() external payable;

    /// @notice Executes a transaction (called directly by entryPoint).
    function execute(address dest, uint256 value, bytes calldata func) external;

    /// @notice Executes a sequence of transactions (called directly by entryPoint).
    function executeBatch(address[] calldata dest, bytes[] calldata func) external;

    /// @notice Check if a signature is valid based on the owner's address.
    /// Compatible with ERC1271
    function isValidSignature(bytes32 _hash, bytes calldata _signatures) external view returns (bytes4);

    /// @notice Compatibility with ERC165
    function supportsInterface(bytes4 interfaceId) external view returns (bool);

    /// @notice Sets the hash of this account, and emits an event.
    function initialize(bytes32 _imageHash) external;

    /// @notice Withdraws value from the account's deposit.
    function withdrawDepositTo(
        address payable withdrawAddress,
        uint256 amount,
        bytes32 _hash,
        bytes calldata _signatures
    ) external;

    /// @notice Returns the entry point contract address for this account.
    function entryPoint() external view returns (IEntryPoint);
}
