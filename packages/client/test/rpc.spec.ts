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

import { expect, test } from "vitest";
import { getChainId, getUserOperationReceipt } from "../src";

test("getChainId", async () => {
  const result = await getChainId(1);

  expect(result._unsafeUnwrap()).toBe("0x1");
});

test("getUserOperationReceipt", async () => {
  const _result = await getUserOperationReceipt(137, [
    "0xe627c1e5e10d3c267692c6b6b1d4ed803a26a237af489f14e597badf87e415a6",
  ]);
  // expect(result._unsafeUnwrap()).toBeDefined();

  // Invalid hex string
  // const invalidResult = await getUserOperationReceipt(10, [
  //   "0x1f5db705609eb03604d24aa0ea154100d638050162131952e8ea7cca69e461a3",
  // ]);

  // console.log(invalidResult);

  // expect(invalidResult.isErr()).toBe(true);
});
