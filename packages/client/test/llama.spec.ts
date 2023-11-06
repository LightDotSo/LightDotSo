// Copyright (C) 2023 Light, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { test, expect } from "vitest";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { getLlama } from "../src"; // Replace with your actual file path

test("getLlama", async () => {
  // Call your function with actual address
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const actualAddress = "0x4fd9D0eE6D6564E80A9Ee00c0163fC952d0A45Ed"; // replace with actual address
  const result = await getLlama(actualAddress);

  // Expect that status is either "success" or "stale"
  // expect(result._unsafeUnwrap().status, "status").tobe([
  //   "success",
  //   "stale",
  // ]);
  // Check that the array length is greater than 0
  expect(result._unsafeUnwrap().protocols.length, "protocols").toBeGreaterThan(
    1,
  );
});
