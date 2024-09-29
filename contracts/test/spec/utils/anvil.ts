// Copyright 2023-2024 LightDotSo.
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

import type { Chain } from "viem";
import { foundry } from "viem/chains";

// From: https://github.com/wagmi-dev/anvil.js/blob/fba736f8a3d1ff2cb6252ae6e6f868dcea05c9dc/examples/example-vitest/tests/utils.ts#L16

//The id of the current test worker.
//This is used by the anvil proxy to route requests to the correct anvil instance.

export const pool = Number(process.env.VITEST_POOL_ID ?? 1);
export const anvil = {
  ...foundry,
  rpcUrls: {
    // These rpc urls are automatically used in the transports.
    default: {
      // Note how we append the worker id to the local rpc urls.
      http: [`http://127.0.0.1:${process.env.VITEST_PORT}/${pool}`],
      webSocket: [`ws://127.0.0.1:${process.env.VITEST_PORT}/${pool}`],
    },
    public: {
      // Note how we append the worker id to the local rpc urls.
      http: [`http://127.0.0.1:${process.env.VITEST_PORT}/${pool}`],
      webSocket: [`ws://127.0.0.1:${process.env.VITEST_PORT}/${pool}`],
    },
  },
} as const satisfies Chain;
