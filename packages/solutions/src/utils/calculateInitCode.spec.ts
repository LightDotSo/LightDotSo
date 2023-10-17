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
