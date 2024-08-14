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
    struct Operation {
        bytes32 hash;
        bytes32[] dependencies;
        bytes[] memory conditionData,
        bytes32 fallbackOperation;
    }

    function addOperation(
        bytes32 hash,
        bytes32[] memory dependencies,
        bytes[] memory conditionData,
        bytes32[] memory salts,
        bytes32 fallbackOperation
    ) public {
        require(conditionData.length == salts.length, "Data and salts length mismatch");

        // Call the condition contracts w/ multicall to get the condition results
        IConditionChecker[] memory conditionContracts = new IConditionChecker[](conditionData.length);


        // Store the operation with the deployed condition contracts
        operations[hash] = Operation({
            hash: hash,
            dependencies: dependencies,
            completed: false,
            conditionContracts: conditionContracts,
            fallbackOperation: fallbackOperation
        });
    }
}
