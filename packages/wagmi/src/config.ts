// Copyright 2023-2024 Light, Inc.
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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { createClient, fallback } from "viem";
import {
  cookieStorage,
  createConfig,
  createStorage,
  http,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  unstable_connector,
} from "wagmi";
import {
  walletConnect,
  injected,
  coinbaseWallet,
  safe,
} from "wagmi/connectors";

// -----------------------------------------------------------------------------
// Config
// -----------------------------------------------------------------------------

export const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!;

// -----------------------------------------------------------------------------
// Wagmi
// -----------------------------------------------------------------------------

// Set up wagmi config
export const wagmiConfig = createConfig({
  chains: CHAINS,
  // client({ chain }) {
  //   return createClient({
  //     chain,
  //     transport: fallback([
  //       http(`https://rpc.light.so/${chain.id}`),
  //       unstable_connector(injected),
  //     ]),
  //   });
  // },
  client: function ({ chain }) {
    return createClient({
      chain: chain,
      transport: http(),
      // transport: fallback([http(), unstable_connector(injected)]),
    });
  },
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
