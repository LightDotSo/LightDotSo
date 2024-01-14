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
import {
  RainbowKitProvider,
  lightTheme,
  darkTheme,
  getDefaultWallets,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit";
import { useTheme } from "next-themes";
import type { ReactNode } from "react";
import { createClient } from "viem";
import {
  WagmiProvider,
  cookieStorage,
  createConfig,
  createStorage,
  http,
} from "wagmi";
import { safe } from "wagmi/connectors";

// -----------------------------------------------------------------------------
// Rainbow
// -----------------------------------------------------------------------------

const walletList = getDefaultWallets();

const connectors = connectorsForWallets(walletList.wallets, {
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,
  appName: "Light",
  appUrl: "https://app.light.so",
});

// -----------------------------------------------------------------------------
// Wagmi
// -----------------------------------------------------------------------------

// Set up wagmi config
export const config = createConfig({
  chains: CHAINS,
  client({ chain }) {
    return createClient({ chain, transport: http() });
  },
  connectors: [safe(), ...connectors],
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
});

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

function Web3Provider({ children }: { children: ReactNode }) {
  // ---------------------------------------------------------------------------
  // Operation Hooks
  // ---------------------------------------------------------------------------

  const { theme } = useTheme();

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <WagmiProvider config={config}>
      <RainbowKitProvider
        theme={theme === "light" ? lightTheme() : darkTheme()}
      >
        {children}
      </RainbowKitProvider>
    </WagmiProvider>
  );
}

export { Web3Provider };
