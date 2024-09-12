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
import { calculateImageHash } from ".";
import type { Signer } from "../typings";

test("calculateImageHash", () => {
  const signers: Signer[] = [
    {
      address: "0x6CA6d1e2D5347Bfab1d91e883F1915560e09129D",
      weight: 1n,
    },
  ];

  const hash = calculateImageHash(1n, 1n, signers);
  // biome-ignore lint/suspicious/noConsole: <explanation>
  console.warn(hash);
  expect(hash).toBe(
    "0xb7f285c774a1c925209bebaab24662b22e7cf32e2f7a412bfcb1bf52294b9ed6",
  );
});
