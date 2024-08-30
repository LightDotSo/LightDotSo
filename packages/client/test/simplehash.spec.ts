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

import { test } from "vitest";

import { getNftValuation, getNftsByOwner } from "../src"; // Replace with your actual file path
// Load dotenv
import "dotenv/config";

test("getNftsByOwner", async () => {
  // Call your function with actual address
  const actualAddress = "0x4fd9D0eE6D6564E80A9Ee00c0163fC952d0A45Ed"; // replace with actual address
  await getNftsByOwner({
    address: actualAddress,
    limit: 10,
    isTestnet: false,
    cursor: null,
  });
  // const result = await getNftsByOwner(actualAddress);

  // Expect that status is either "success" or "stale"
  // expect(result._unsafeUnwrap().status, "status").tobe([
  //   "success",
  //   "stale",
  // ]);
  // Check that the array length is greater than 0
  // expect(
  //   (result as { _unsafeUnwrap: () => any })._unsafeUnwrap().wallets.length,
  // ).toBeGreaterThan(0);

  // Log the result
  // console.log(result._unsafeUnwrap());

  // Log the result
  // console.log(result._unsafeUnwrap());
});

test("getNftValuation", async () => {
  // Call your function with actual address

  const actualAddress = "0x4fd9D0eE6D6564E80A9Ee00c0163fC952d0A45Ed"; // replace with actual address
  await getNftValuation(actualAddress);
  // const result = await getNftValuation(actualAddress);

  // Expect that status is either "success" or "stale"
  // expect(result._unsafeUnwrap().status, "status").tobe([
  //   "success",
  //   "stale",
  // ]);
  // Check that the array length is greater than 0
  // expect(result._unsafeUnwrap().wallets.length).toBeGreaterThan(0);

  // Log the result
  // console.log(result._unsafeUnwrap());
});
