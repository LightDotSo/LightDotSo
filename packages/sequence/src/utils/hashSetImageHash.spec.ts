// Copyright 2023-2024 Light
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
import { hashSetImageHash } from ".";

test("hashSetImageHash", () => {
  const initCode = hashSetImageHash(
    "0xd1f0b86cdfe4b6869e7739e1dc3316396b4a2235ec369df8a2c43b03e6df5ca1",
  );

  expect(initCode).toBe(
    "0x24bd60cb5eadbc863ea511eeefa20cb7a2e9f15daf6389f1fdab25f429a19013",
  );
});
