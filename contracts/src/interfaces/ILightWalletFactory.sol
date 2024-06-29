// Copyright 2023-2024 Light.
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

import {LightWallet} from "../LightWallet.sol";

interface ILightWalletFactory {
    // -------------------------------------------------------------------------
    // Errors
    // -------------------------------------------------------------------------

    error EntrypointAddressZero();

    // -------------------------------------------------------------------------
    // Actions
    // -------------------------------------------------------------------------

    /// @notice Gets the address of the account implementation contract
    function accountImplementation() external view returns (LightWallet);

    /// @notice Creates an account and returns its address
    function createAccount(bytes32 hash, bytes32 salt) external returns (LightWallet);

    /// @notice Calculates the counterfactual address of an account
    function getAddress(bytes32 hash, bytes32 salt) external view returns (address);
}
