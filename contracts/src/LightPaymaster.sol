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

// Coinbase's magic-spend library is used to handle the flexible payment paymaster functionality for 4337 compatible wallets.
// Link: https://github.com/coinbase/magic-spend/blob/122a58ddb8c6a99dd54585357e877ae8d0cbc9a7/src/MagicSpend.sol
// License: MIT

import {MagicSpend} from "magic-spend/MagicSpend.sol";

/// @title LightPaymaster
/// @author @shunkakinoki
/// @notice LightPaymaster is a paymaster for Light Protocol.
/// @dev This contract is used to handle the flexible payment paymaster functionality for 4337 compatible wallets.
contract LightPaymaster is MagicSpend {
    // -------------------------------------------------------------------------
    // Constant
    // -------------------------------------------------------------------------

    /// @notice The name for this contract
    string public constant NAME = "LightPaymaster";

    /// @notice The version for this contract
    string public constant VERSION = "0.1.0";

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(address entryPoint) MagicSpend(entryPoint) {}
}
