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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { test } from "vitest";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { getLlama } from "../src"; // Replace with your actual file path

test("getLlama", async () => {
  // Call your function with actual address
  const actualAddress = "0x4fd9D0eE6D6564E80A9Ee00c0163fC952d0A45Ed"; // replace with actual address
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _result = await getLlama(actualAddress);

  // Expect that status is either "success" or "stale"
  // expect(result._unsafeUnwrap().status, "status").tobe([
  //   "success",
  //   "stale",
  // ]);
});
