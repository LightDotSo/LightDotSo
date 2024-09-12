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
import { LightTimelockControllerFactory } from "@/contracts/LightTimelockControllerFactory.sol";
import { expect, test } from "vitest";

test("LightTimelockControllerFactory: Correct humanReadableAbi", () => {
  expect(
    Object.values(LightTimelockControllerFactory.humanReadableAbi),
  ).toMatchInlineSnapshot(`
    [
      "constructor()",
      "error LightProtocolControllerAddressZero()",
      "error LightWalletAddressZero()",
      "function NAME() view returns (string)",
      "function VERSION() view returns (string)",
      "function createTimelockController(address lightWallet, address lightProtocolController, bytes32 salt) returns (address ret)",
      "function getAddress(address lightWallet, address lightProtocolController, bytes32 salt) view returns (address)",
      "function timelockImplementation() view returns (address)",
    ]
  `);
});
