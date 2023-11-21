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
import type { Signer } from "../typings";
import { calculateImageHash } from ".";

test("calculateImageHash", () => {
  const signers: Signer[] = [
    {
      address: "0x6CA6d1e2D5347Bfab1d91e883F1915560e09129D",
      weight: 1n,
    },
  ];

  const hash = calculateImageHash(1n, 1n, signers);
  console.warn(hash);
  expect(hash).toBe(
    "0xb7f285c774a1c925209bebaab24662b22e7cf32e2f7a412bfcb1bf52294b9ed6",
  );
});
