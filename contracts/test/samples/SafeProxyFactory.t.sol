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

import {SafeProxy} from "@/contracts/samples/SafeProxy.sol";
import {SafeProxyFactory} from "@/contracts/samples/SafeProxyFactory.sol";
import {Test} from "forge-std/Test.sol";

contract SafeProxyFactoryTest is Test {
    SafeProxyFactory private factory;

    function setUp() public {
        factory = new SafeProxyFactory();
    }

    // Test that the proxy creation code is the same as the one in SafeProxy
    function test_safe_proxyCreationCode() public {
        assertEq(factory.proxyCreationCode(), type(SafeProxy).creationCode);
    }
}
