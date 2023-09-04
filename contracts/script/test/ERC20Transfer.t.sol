// Copyright (C) 2023 Light, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.18;

import {LightWallet} from "@/contracts/LightWallet.sol";
import {LightWalletFactory} from "@/contracts/LightWalletFactory.sol";
import {LightDeployer} from "@/script/abstract/LightDeployer.s.sol";
import {ERC20TransferFlowScript} from "@/script/flow/ERC20TransferFlow.s.sol";
import {MockERC20} from "solmate/test/utils/mocks/MockERC20.sol";
// solhint-disable-next-line no-console
import {console} from "forge-std/console.sol";
import {Script} from "forge-std/Script.sol";
import {Test} from "forge-std/Test.sol";

// ERC20Transfer -- Test ERC20 transfer
contract ERC20TransferFlowScriptTest is LightDeployer, Script, Test {
    ERC20TransferFlowScript script;

    function run() public {
        script = new ERC20TransferFlowScript();
    }

    function test_run() public {
        script.run();
    }
}
