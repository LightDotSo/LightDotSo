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
import { LightDAG } from "@/contracts/LightDAG.sol";
import { expect, test } from "vitest";

test("LightDAG: Correct humanReadableAbi", () => {
  expect(Object.values(LightDAG.humanReadableAbi)).toMatchInlineSnapshot(`
    [
      "event OperationCalled(bytes32 indexed operation, address indexed caller, bytes[] conditionData, bytes32[] dependencies, bytes32 fallbackOperation)",
      "event OperationRootCalled(bytes32 indexed root, address indexed caller)",
      "function NAME() view returns (string)",
      "function VERSION() view returns (string)",
      "function callOperationRoot((bytes32 root, (bytes32 hash, bytes[] conditionData, bytes32[] dependencies, bytes32 fallbackOperation)[] operations, address verifier) operationRoot)",
    ]
  `);
});
