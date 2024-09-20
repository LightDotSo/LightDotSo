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

/// @title ILightTimelockController
/// @notice Interface for the LightTimelockController contract
interface ILightTimelockController {
    // -------------------------------------------------------------------------
    // Structs
    // -------------------------------------------------------------------------

    struct Deposit {
        address inputToken;
        uint256 inputAmount;
        address userOpSender;
    }

    struct ExecutionIntent {
        address fillerRecipient;
        address userOpSender;
        ExecutionToken[] executionTokens;
    }

    struct ExecutionToken {
        address token;
        uint256 amount;
        uint256 chainId;
        int64 executionFeePercentage;
    }

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    event DepositMade(address indexed inputToken, uint256 inputAmount, address userOpSender);
    event ExecutionIntentRecorded(
        address indexed fillerRecipient, address indexed userOpSender, ExecutionToken[] executionTokens
    );
    event WithdrawCompleted(address indexed inputToken, uint256 amount, address userOpSender);

    // -------------------------------------------------------------------------
    // Functions
    // -------------------------------------------------------------------------

    function deposit(address inputToken, uint256 inputAmount, address userOpSender) external payable;
    function recordExecutionIntent(ExecutionIntent calldata executionIntent) external;
    function withdraw(address inputToken, uint256 amount, address userOpSender) external;
}
