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
