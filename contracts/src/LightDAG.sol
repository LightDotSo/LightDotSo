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

    /// @notice The operation struct
    struct Operation {
        bytes32 hash;
        bytes[] conditionData;
        bytes32[] dependencies;
        bytes32 fallbackOperation;
    }

    /// @notice The root of the operation
    struct OperationRoot {
        bytes32 root;
        Operation[] operations;
    }

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    /// @notice Emitted when an operation root is called
    /// @param root The root of the operation
    /// @param caller The address that called the operation root
    event OperationRootCalled(bytes32 indexed root, address indexed caller);

    /// @notice Emitted when an operation is called
    /// @param operation The operation
    /// @param caller The address that called the operation
    /// @param conditionData The condition data for the operation
    /// @param dependencies The dependencies for the operation
    /// @param fallbackOperation The fallback operation for the operation
    event OperationCalled(
        bytes32 indexed operation,
        address indexed caller,
        bytes[] conditionData,
        bytes32[] dependencies,
        bytes32 fallbackOperation
    );

    // -------------------------------------------------------------------------
    // Constant
    // -------------------------------------------------------------------------

    /// @notice The name for this contract
    string public constant NAME = "LightDAG";

    /// @notice The version for this contract
    string public constant VERSION = "0.1.0";

    // -------------------------------------------------------------------------
    // Constant
    // -------------------------------------------------------------------------

    function callOperationRoot(OperationRoot memory operationRoot) public {
        // Check if the operation root is valid
        require(operationRoot.root != bytes32(0), "LightDAG: Operation root is empty");

        // Call the operation root event
        emit OperationRootCalled(operationRoot.root, msg.sender);

        // Call the operations
        for (uint256 i = 0; i < operationRoot.operations.length; i++) {
            emit OperationCalled(
                operationRoot.operations[i].hash,
                msg.sender,
                operationRoot.operations[i].conditionData,
                operationRoot.operations[i].dependencies,
                operationRoot.operations[i].fallbackOperation
            );
        }
    }
}
