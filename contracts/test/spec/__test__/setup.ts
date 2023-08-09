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

import { fetchLogs } from "@viem/anvil";
import { testClient } from "@/contracts/test/spec/utils";
import { afterAll, afterEach, vi } from "vitest";
import { setAutomine, setIntervalMining } from "viem/test";

afterAll(async () => {
  vi.restoreAllMocks();

  // Reset the anvil instance to the same state it was in before the tests started.
  await Promise.all([
    () => testClient.reset(),
    () => setAutomine(testClient, false),
    () => setIntervalMining(testClient, { interval: 1 }),
  ]);
});

// From: https://github.com/wagmi-dev/viem/blob/41bafa3d8db3d9dd58c0179d15c9e7d00b00871c/src/_test/setup.ts#L41-L65
afterEach(context => {
  // Print the last log entries from anvil after each test.
  context.onTestFailed(async result => {
    try {
      const poolId = Number(process.env.VITEST_POOL_ID ?? 1);
      const response = await fetchLogs("http://127.0.0.1:8585", poolId);
      const logs = response.slice(-20);

      if (logs.length === 0) {
        return;
      }

      // Try to append the log messages to the vitest error message if possible. Otherwise, print them to the console.
      const error = result.errors?.[0];

      if (error !== undefined) {
        error.message +=
          "\n\nAnvil log output\n=======================================\n";
        error.message += `\n${logs.join("\n")}`;
      } else {
        console.warn(...logs);
      }
    } catch {
      /* empty */
    }
  });
});
