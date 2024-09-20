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

import {PackedUserOperation} from "@eth-infinitism/account-abstraction/contracts/interfaces/PackedUserOperation.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {TimelockControllerUpgradeable} from
    "@openzeppelin/contracts-upgradeable/governance/TimelockControllerUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ILightTimelockController} from "@/contracts/interfaces/ILightTimelockController.sol";

/// @title LightTimelockController
/// @author @shunkakinoki
/// @notice LightTimelockController is a timelock controller contract for Light Protocol.
/// This is the version 0.1.0 contract for Light Protocol.
/// @dev The contract is the initial implementation of a timelock controller for Light Protocol.
/// @dev Further implementations will be added in the future, and may be subject to change.
contract LightTimelockController is
    ILightTimelockController,
    Initializable,
    ReentrancyGuardUpgradeable,
    TimelockControllerUpgradeable,
    UUPSUpgradeable
{
    // -------------------------------------------------------------------------
    // State Variables
    // -------------------------------------------------------------------------

    mapping(bytes32 => Deposit) public deposits;
    mapping(bytes32 => Execution) public executions;
    mapping(bytes32 => ExecutionIntent) public executionIntents;

    // -------------------------------------------------------------------------
    // Constant
    // -------------------------------------------------------------------------

    /// @notice The name for this contract
    string public constant NAME = "LightTimelockController";

    /// @notice The version for this contract
    string public constant VERSION = "0.1.0";

    /// @notice The minimum delay for the timelock
    uint256 public immutable MIN_DELAY = 300 seconds;

    // -------------------------------------------------------------------------
    // Constructor + Functions
    // -------------------------------------------------------------------------

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice Initialize the timelock controller
    /// @param lightProtocolController The address of the light protocol controller (executor and canceler)
    /// @dev This function is called by the factory contract
    function initialize(address lightProtocolController) public virtual initializer {
        // Initialize the timelock controller as in `__TimelockController_init_unchained`
        // Proposer is set to none (not initialized)
        // Executor is set to none (not initialized)
        // Admin is set to the light protocol controller
        __TimelockController_init(MIN_DELAY, new address[](0), new address[](0), lightProtocolController);
    }

    // -------------------------------------------------------------------------
    // Deposit Function
    // -------------------------------------------------------------------------

    /// @notice Allows a user to make a deposit
    /// @param inputToken The address of the token being deposited (address(0) for native tokens)
    /// @param inputAmount The amount of tokens being deposited
    /// @param userOpSender The address of the user operation sender
    function deposit(address inputToken, uint256 inputAmount, address userOpSender) external payable nonReentrant {
        require(userOpSender != address(0), "Invalid userOpSender");

        uint256 amount;
        if (inputToken == address(0)) {
            // Native token deposit
            amount = msg.value;
            // solhint-disable-next-line reason-string
            require(amount > 0, "Deposit amount must be greater than 0");
            require(inputAmount == amount, "Inconsistent native token amount");
        } else {
            // ERC20 token deposit
            // solhint-disable-next-line reason-string
            require(inputAmount > 0, "Deposit amount must be greater than 0");
            require(msg.value == 0, "ETH sent with ERC20 deposit");
            amount = inputAmount;
            require(IERC20(inputToken).transferFrom(msg.sender, address(this), amount), "ERC20 transfer failed");
        }

        emit DepositMade(inputToken, amount, userOpSender);
    }

    // -------------------------------------------------------------------------
    // Execution Function
    // -------------------------------------------------------------------------

    /// @notice Records an execution by a filler
    /// @param userOpHash The hash of the user operation
    /// @param fillerRecipient The address of the filler recipient
    function recordExecution(PackedUserOperation calldata userOp, bytes32 userOpHash, address fillerRecipient)
        external
    {
        require(userOp.sender != msg.sender, "Invalid userOpSender");

        executions[userOpHash] = Execution(userOpHash, fillerRecipient);

        emit ExecutionCompleted(userOpHash, fillerRecipient);
    }

    // -------------------------------------------------------------------------
    // Execution Intent Function
    // -------------------------------------------------------------------------

    /// @notice Emits an execution intent by a filler
    /// @param fillerRecipient The address of the filler recipient
    /// @param userOpHash The hash of the user operation
    function emitExecutionIntent(bytes32 userOpHash, address fillerRecipient) external {
        bytes32 intentId = keccak256(abi.encodePacked(userOpHash, fillerRecipient, block.timestamp));

        executionIntents[intentId] = ExecutionIntent(userOpHash, fillerRecipient);

        emit ExecutionIntentEmitted(userOpHash, intentId, fillerRecipient);
    }

    // -------------------------------------------------------------------------
    // Upgrades
    // -------------------------------------------------------------------------

    /// @dev Only callable by the current contract
    /// @inheritdoc UUPSUpgradeable
    function _authorizeUpgrade(address) internal view override onlyRoleOrOpenRole(DEFAULT_ADMIN_ROLE) {}
}
