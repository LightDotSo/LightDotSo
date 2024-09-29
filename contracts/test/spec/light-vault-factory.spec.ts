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

//@ts-expect-error
import { LightVaultFactory } from "@/contracts/LightVaultFactory.sol";
import { expect, test } from "vitest";

test("LightVaultFactory: Correct humanReadableAbi", () => {
  expect(
    Object.values(LightVaultFactory.humanReadableAbi),
  ).toMatchInlineSnapshot(`
    [
      "constructor()",
      "error Create2EmptyBytecode()",
      "error Create2FailedDeployment()",
      "error Create2InsufficientBalance(uint256 balance, uint256 needed)",
      "error TokenAddressZero()",
      "function LIGHT_PROTOCOL_FEES() view returns (uint16)",
      "function LIGHT_PROTOCOL_OWNER() view returns (address)",
      "function LIGHT_PROTOCOL_TREASURY() view returns (address)",
      "function NAME() view returns (string)",
      "function VERSION() view returns (string)",
      "function createVault(address underlying, uint256 bootstrapAmount, string name, string symbol) returns (address ret)",
      "function getAddress(address underlying, uint256 bootstrapAmount, string name, string symbol) view returns (address)",
      "function vaultImplementation() view returns (address)",
    ]
  `);
});
