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

import { fetchLogs } from "@viem/anvil";
import { setAutomine, setIntervalMining } from "viem/actions";
import { afterAll, afterEach, vi } from "vitest";
import { testClient } from "@/contracts/test/spec/utils";

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
