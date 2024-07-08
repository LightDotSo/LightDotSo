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
import { calculateInitCode } from ".";

test("calculateInitCode", () => {
  const initCode = calculateInitCode(
    "0x0000000000756D3E6464f5efe7e413a0Af1C7474",
    "0xb7f285c774a1c925209bebaab24662b22e7cf32e2f7a412bfcb1bf52294b9ed6",
    "0x00000000000000000000000000000000000000000000000000000000000004fb",
  );

  expect(initCode).toBe(
    "0x0000000000756d3e6464f5efe7e413a0af1c7474183815c8b7f285c774a1c925209bebaab24662b22e7cf32e2f7a412bfcb1bf52294b9ed600000000000000000000000000000000000000000000000000000000000004fb",
  );
});
