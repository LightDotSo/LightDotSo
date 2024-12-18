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

import { CHAINS } from "@lightdotso/const";
import { type Chain, createClient } from "viem";
import {
  http,
  type Config,
  cookieStorage,
  createConfig,
  createStorage,
} from "wagmi";
import {
  coinbaseWallet,
  injected,
  safe,
  walletConnect,
} from "wagmi/connectors";

// -----------------------------------------------------------------------------
// Config
// -----------------------------------------------------------------------------

// biome-ignore lint/style/noNonNullAssertion: <explanation>
export const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!;

// -----------------------------------------------------------------------------
// Wagmi
// -----------------------------------------------------------------------------

// Set up wagmi config
export const wagmiConfig: Config = createConfig({
  chains: CHAINS as readonly [Chain, ...Chain[]],
  // client({ chain }) {
  //   return createClient({
  //     chain,
  //     transport: fallback([
  //       http(`https://rpc.light.so/${chain.id}`),
  //       unstable_connector(injected),
  //     ]),
  //   });
  // },
  client: ({ chain }) =>
    createClient({
      chain: chain,
      transport: http(),
      // transport: fallback([http(), unstable_connector(injected)]),
    }),
  connectors: [
    coinbaseWallet({
      appName: "Light",
      headlessMode: true,
      overrideIsMetaMask: false,
    }),
    ...(projectId
      ? [walletConnect({ projectId: projectId, showQrModal: false })]
      : []),
    safe(),
    injected({ shimDisconnect: true }),
  ],
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  syncConnectedChain: false,
});
