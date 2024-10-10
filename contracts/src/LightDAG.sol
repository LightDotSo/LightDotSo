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

interface IMulticall {
    struct Call {
        address target;
        bytes callData;
    }

    function aggregate(Call[] memory calls)
        external
        view
        returns (uint256 blockNumber, bytes[] memory returnData);
}

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
}

/// @title LightDAG
/// @author @shunkakinoki
/// @notice LightDAG is an implementation contract for Light Protocol.
/// This is the version 0.1.0 contract for Light Protocol.
/// @dev The contract is the initial implementation of a Directed Acyclic Graph (DAG) for Light
/// Protocol.
/// @dev Further implementations will be added in the future, and may be subject to change.
contract LightDAG {
    // -------------------------------------------------------------------------
    // Types
    // -------------------------------------------------------------------------

    /// @notice The operation struct
    struct LightOperation {
        bytes32 id;
        uint256 chainId;
        bytes[] conditionData;
        bytes32[] dependencies;
    }

    /// @notice The root of the operation
    struct LightOperationDAG {
        bytes32 rootId;
        LightOperation[] operations;
        address verifier;
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
    // Immutable Storage
    // -------------------------------------------------------------------------

    /// @notice The address of the Multicall contract
    address public immutable multicallAddress;

    // -------------------------------------------------------------------------
    // Constructor + Functions
    // -------------------------------------------------------------------------

    /// @notice Initializes the contract with the Multicall address
    /// @param _multicallAddress The address of the Multicall contract
    constructor(address _multicallAddress) {
        require(_multicallAddress != address(0), "Invalid Multicall address");
        multicallAddress = _multicallAddress;
    }

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

    /// @notice Checks if the LightOperationRoot is valid
    /// @param operationRoot The LightOperationRoot to check
    /// @return success Whether the LightOperationRoot is valid
    function checkLightOperationRoot(LightOperationDAG memory operationRoot)
        public
        view
        returns (bool success)
    {
        // Check if the operation root is valid
        require(operationRoot.rootId != bytes32(0), "LightDAG: Operation root is empty");

        // Check if the operation root is valid
        require(operationRoot.verifier != address(0), "LightDAG: Operation root is empty");

        // Check if the operation root is valid
        require(operationRoot.verifier != address(0), "LightDAG: Operation root is empty");
    }

    /// @notice Processes a LightOperation and calls the multicall contract
    /// @param operation The LightOperation to process
    /// @return success Whether all conditions in the operation were met
    function processLightOperation(LightOperation memory operation)
        public
        view
        returns (bool success)
    {
        require(operation.chainId == block.chainid, "Invalid chain ID");

        IMulticall multicall = IMulticall(multicallAddress);
        IMulticall.Call[] memory calls = new IMulticall.Call[](operation.conditionData.length);

        for (uint256 i = 0; i < operation.conditionData.length; i++) {
            (address target, bytes memory data) =
                abi.decode(operation.conditionData[i], (address, bytes));
            calls[i] = IMulticall.Call({target: target, callData: data});
        }

        (, bytes[] memory returnData) = multicall.aggregate(calls);

        success = true;
        for (uint256 i = 0; i < returnData.length; i++) {
            bool conditionMet = abi.decode(returnData[i], (bool));
            if (!conditionMet) {
                success = false;
                break;
            }
        }

        return success;
    }

    /// @notice Checks if an address has the required balance of a token
    /// @param account The address to check the balance of
    /// @param tokenAddress The address of the token (use address(0) for native token)
    /// @param requiredBalance The minimum balance required
    /// @return success Whether the account has at least the required balance
    function checkBalance(
        address account,
        address tokenAddress,
        uint256 requiredBalance
    )
        public
        view
        returns (bool success)
    {
        uint256 balance;
        if (tokenAddress == address(0)) {
            balance = account.balance;
        } else {
            balance = IERC20(tokenAddress).balanceOf(account);
        }
        return balance >= requiredBalance;
    }
}
