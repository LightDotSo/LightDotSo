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

import { expect, test } from "vitest";
//@ts-expect-error
import { LightWalletFactory } from "@/contracts/LightWalletFactory.sol";

test("LightWalletFactory: Correct humanReadableAbi", () => {
  expect(Object.values(LightWalletFactory.humanReadableAbi))
    .toMatchInlineSnapshot(`
    [
      "constructor(address entryPoint)",
      "error EntrypointAddressZero()",
      "function NAME() view returns (string)",
      "function VERSION() view returns (string)",
      "function accountImplementation() view returns (address)",
      "function createAccount(bytes32 hash, bytes32 salt) returns (address ret)",
      "function getAddress(bytes32 hash, bytes32 salt) view returns (address)",
    ]
  `);
});
