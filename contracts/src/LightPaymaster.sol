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

import {MagicSpend} from "magic-spend/MagicSpend.sol";

// LightPaymaster -- Paymaster for Light
contract LightPaymaster is MagicSpend {
    // -------------------------------------------------------------------------
    // Constant
    // -------------------------------------------------------------------------

    /// @notice The name for this contract
    string public constant NAME = "LightPaymaster";

    /// @notice The version for this contract
    string public constant VERSION = "0.3.0";

    // -------------------------------------------------------------------------
    // Immutable
    // -------------------------------------------------------------------------

    /// @notice The minimum delay for the timelock
    uint256 public immutable MIN_DELAY = 300 seconds;

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(address owner_, uint256 maxWithdrawDenominator_) MagicSpend(owner_, maxWithdrawDenominator_) {}
}
