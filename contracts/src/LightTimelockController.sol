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
    /// @param executionIntent The execution intent to record
    function recordExecutionIntent(ExecutionIntent calldata executionIntent) external {
        require(executionIntent.executionTokens.length > 0, "Invalid executionTokens");
        require(executionIntent.fillerRecipient != address(0), "Invalid fillerRecipient");
        require(executionIntent.userOpSender != msg.sender, "Invalid userOpSender");

        emit ExecutionIntentRecorded(
            executionIntent.fillerRecipient, executionIntent.userOpSender, executionIntent.executionTokens
        );
    }

    // -------------------------------------------------------------------------
    // Withdraw Function
    // -------------------------------------------------------------------------

    /// @notice Allows a user to withdraw their deposit
    /// @dev This function is called by the TimelockController's `execute` function after the timelock period
    /// @param inputToken The address of the token being withdrawn (address(0) for native tokens)
    /// @param amount The amount of tokens being withdrawn
    /// @param userOpSender The address of the user operation sender
    function withdraw(address inputToken, uint256 amount, address userOpSender) external nonReentrant {
        require(msg.sender == address(this), "Only callable by timelock");
        require(userOpSender != address(0), "Invalid userOpSender");
        require(amount > 0, "Withdraw amount must be greater than 0");

        if (inputToken == address(0)) {
            // Native token withdrawal
            (bool success,) = userOpSender.call{value: amount}("");
            require(success, "Native token transfer failed");
        } else {
            // ERC20 token withdrawal
            require(IERC20(inputToken).transfer(userOpSender, amount), "ERC20 transfer failed");
        }

        emit WithdrawCompleted(inputToken, amount, userOpSender);
    }

    // -------------------------------------------------------------------------
    // Upgrades
    // -------------------------------------------------------------------------

    /// @dev Only callable by the current contract
    /// @inheritdoc UUPSUpgradeable
    function _authorizeUpgrade(address) internal view override onlyRoleOrOpenRole(DEFAULT_ADMIN_ROLE) {}
}
