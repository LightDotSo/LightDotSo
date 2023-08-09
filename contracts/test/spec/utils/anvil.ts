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

import { type Chain } from "viem";
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
      http: [`http://127.0.0.1:8585/${pool}`],
      webSocket: [`ws://127.0.0.1:8585/${pool}`],
    },
    public: {
      // Note how we append the worker id to the local rpc urls.
      http: [`http://127.0.0.1:8585/${pool}`],
      webSocket: [`ws://127.0.0.1:8585/${pool}`],
    },
  },
} as const satisfies Chain;
