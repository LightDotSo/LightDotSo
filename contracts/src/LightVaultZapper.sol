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

// Core is forked from the work of Amphor Protocol
// Link:
// https://github.com/AmphorProtocol/asynchronous-vault/blob/e2f030244f43a651031598bd2051de029628154e/src/AsyncVault.sol
// License: MIT

import {VaultZapper} from "asynchronous-vault-patch/VaultZapper.sol";

/// @title LightVaultZapper
/// @author @shunkakinoki
/// @notice LightVaultZapper is an implementation contract for Light Protocol.
/// This is the version 0.1.0 contract for Light Protocol.
/// @dev The contract is the initial implementation of a vault for Light Protocol.
/// @dev Further implementations will be added in the future, and may be subject to change.
contract LightVaultZapper is VaultZapper {
    // -------------------------------------------------------------------------
    // Constant
    // -------------------------------------------------------------------------

    /// @notice The name for this contract
    string public constant NAME = "LightVaultZapper";

    /// @notice The version for this contract
    string public constant VERSION = "0.1.0";

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor() VaultZapper() {}
}
