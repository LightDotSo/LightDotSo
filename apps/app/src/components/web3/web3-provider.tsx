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

"use client";

import { CHAINS } from "@lightdotso/const";
import { createWeb3Modal } from "@web3modal/wagmi";
import { useTheme } from "next-themes";
import type { ReactNode } from "react";
import { Chain, createClient } from "viem";
import {
  State,
  WagmiProvider,
  cookieStorage,
  createConfig,
  createStorage,
  http,
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

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!;

// -----------------------------------------------------------------------------
// Wagmi
// -----------------------------------------------------------------------------

// Set up wagmi config
export const wagmiConfig = createConfig({
  chains: CHAINS,
  client({ chain }) {
    return createClient({ chain, transport: http() });
  },
  connectors: [
    coinbaseWallet({ appName: "Light" }),
    walletConnect({ projectId, showQrModal: false }),
    safe(),
    injected({ shimDisconnect: true }),
  ],
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
});

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

function Web3Provider({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState?: State;
}) {
  // ---------------------------------------------------------------------------
  // Operation Hooks
  // ---------------------------------------------------------------------------

  const { theme } = useTheme();

  // ---------------------------------------------------------------------------
  // Web3Modal
  // ---------------------------------------------------------------------------

  createWeb3Modal({
    // @ts-expect-error
    chains: CHAINS,
    wagmiConfig,
    projectId,
    themeMode: theme === "light" ? "light" : "dark",
  });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      {children}
    </WagmiProvider>
  );
}

export { Web3Provider };
