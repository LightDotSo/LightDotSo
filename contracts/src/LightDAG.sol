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

import {IConditionChecker} from "@/contracts/interfaces/IConditionChecker.sol";

pragma solidity ^0.8.18;

/// @title LightDAG
/// @author @shunkakinoki
/// @notice LightDAG is an implementation contract for Light Protocol.
/// This is the version 0.1.0 contract for Light Protocol.
/// @dev The contract is the initial implementation of a Directed Acyclic Graph (DAG) for Light Protocol.
/// @dev Further implementations will be added in the future, and may be subject to change.
contract LightDAG {
    // -------------------------------------------------------------------------
    // Types
    // -------------------------------------------------------------------------

    struct Operation {
        bytes32 hash;
        bytes[] conditionData;
        bytes32[] dependencies;
        bytes32 fallbackOperation;
    }

    struct OperationRoot {
        bytes32 root;
        Operation[] operations;
    }

    // -------------------------------------------------------------------------
    // Constant
    // -------------------------------------------------------------------------

    /// @notice The name for this contract
    string public constant NAME = "LightWalletFactory";

    /// @notice The version for this contract
    string public constant VERSION = "0.3.0";

    // -------------------------------------------------------------------------
    // Constant
    // -------------------------------------------------------------------------

    function addOperationRoot(OperationRoot memory operationRoot) pure {
        // Check if the operation root is valid
        require(operationRoot.root != bytes32(0), "LightDAG: Operation root is empty");
    }
}
