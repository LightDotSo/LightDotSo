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

import { startProxy } from "@viem/anvil";

// From: https://github.com/wagmi-dev/anvil.js/blob/fba736f8a3d1ff2cb6252ae6e6f868dcea05c9dc/examples/example-vitest/tests/constants.ts#L22C1-L26C2
export const FORK_RPC_URL = process.env.ETH_RPC_MAINNET;

if (!process.env.ETH_RPC_MAINNET) {
  throw new Error('Missing environment variable "ETH_RPC_MAINNET"');
}

export default async function () {
  return await startProxy({
    options: {
      forkUrl: FORK_RPC_URL,
    },
  });
}
