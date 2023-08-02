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

import { expect, test } from "vitest";
import { subdigestOf } from "..";

test("subdigestOf", () => {
  const ls = subdigestOf(`0x${"00".repeat(20)}`, new Uint8Array(32), 1n);
  console.warn(ls);
  expect(ls).toBe(
    "0x4f8026b280821a8d35671eb214849f3d4ed6caf6418ca57be15a139a0d8cf4e5",
  );
});
