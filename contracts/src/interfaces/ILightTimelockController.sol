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

    struct Execution {
        bytes32 userOpHash;
        address fillerRecipient;
    }

    struct ExecutionIntent {
        bytes32 userOpHash;
        address fillerRecipient;
    }

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    event DepositMade(address indexed inputToken, uint256 inputAmount, address userOpSender);
    event ExecutionCompleted(bytes32 indexed userOpHash, address fillerRecipient);
    event ExecutionIntentEmitted(
        bytes32 indexed userOpHash, bytes32 indexed executionIntentId, address fillerRecipient
    );

    // -------------------------------------------------------------------------
    // Functions
    // -------------------------------------------------------------------------

    function deposit(address inputToken, uint256 inputAmount, address userOpSender) external payable;
    function recordExecution(PackedUserOperation calldata userOp, bytes32 userOpHash, address fillerRecipient)
        external;
    function emitExecutionIntent(bytes32 userOpHash, address fillerRecipient) external;
}
