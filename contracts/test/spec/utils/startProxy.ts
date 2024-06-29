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
