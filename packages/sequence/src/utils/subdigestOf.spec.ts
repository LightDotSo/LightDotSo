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

import { toBytes } from "viem";
import { expect, test } from "vitest";
import { subdigestOf } from "..";

test("subdigestOf", () => {
  const res = subdigestOf(
    "0x5615dEB798BB3E4dFa0139dFa1b3D433Cc23b72f",
    toBytes(
      "0x0000000000000000000000000000000000000000000000000000000000000001",
    ),
    1n,
  );
  expect(res).toBe(
    "0x349298d2e05ff7da41925abdea9f3453feada8ea0b96bac074d14609ce004ded",
  );
});
