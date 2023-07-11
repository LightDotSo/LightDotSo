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
import { publicClient, testClient } from "@/contracts/test/spec/utils";
import { accounts } from "@/contracts/test/spec/utils/constants";
import { setBalance } from "viem/test";

const targetAccount = accounts[0];

async function setup() {
  await setBalance(testClient, {
    address: targetAccount.address,
    value: targetAccount.balance,
  });
}

test("sends transaction", async () => {
  await setup();

  expect(
    await publicClient.getBalance({ address: targetAccount.address }),
  ).toMatchInlineSnapshot("10000000000000000000000n");
});
