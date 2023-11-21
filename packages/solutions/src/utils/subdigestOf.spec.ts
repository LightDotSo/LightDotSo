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
