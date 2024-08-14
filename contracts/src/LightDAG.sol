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

pragma solidity ^0.8.18;

interface IConditionChecker {
    function checkCondition(bytes calldata data) external returns (bool);
}

/// @title LightDAG
/// @author @shunkakinoki
/// @notice LightDAG is an implementation contract for Light Protocol.
/// This is the version 0.1.0 contract for Light Protocol.
/// @dev The contract is the initial implementation of a Directed Acyclic Graph (DAG) for Light Protocol.
/// @dev Further implementations will be added in the future, and may be subject to change.
contract LightDAG {
    struct Task {
        bytes32 hash;
        bytes32[] dependencies;
        bool completed;
        address[] conditionContracts;
        bytes32 fallbackOperation;
    }

    mapping(bytes32 => Task) public tasks;

    function deployConditionChecker(bytes memory data, bytes32 salt) public returns (address) {
        bytes memory bytecode = abi.encodePacked(type(ConditionChecker).creationCode, abi.encode(data));
        return address(0).deploy(bytecode, salt);
    }

    function addTask(
        bytes32 hash,
        bytes32[] memory dependencies,
        bytes[] memory conditionData,
        bytes32[] memory salts,
        bytes32 fallbackOperation
    ) public {
        require(conditionData.length == salts.length, "Data and salts length mismatch");

        address[] memory conditionContracts = new address[](conditionData.length);
        for (uint256 i = 0; i < conditionData.length; i++) {
            conditionContracts[i] = deployConditionChecker(conditionData[i], salts[i]);
        }

        // Store the task with the deployed condition contracts
        tasks[hash] = Task({
            hash: hash,
            dependencies: dependencies,
            completed: false,
            conditionContracts: conditionContracts,
            fallbackOperation: fallbackOperation
        });
    }
}
