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

import { test, expect } from "vitest";
import { getLlama } from "../src"; // Replace with your actual file path

test("getLlama", async () => {
  // Call your function with actual address
  const actualAddress = "0x4fd9D0eE6D6564E80A9Ee00c0163fC952d0A45Ed"; // replace with actual address
  const result = await getLlama(actualAddress);

  expect(result.status, "status").toBe("success");
});
