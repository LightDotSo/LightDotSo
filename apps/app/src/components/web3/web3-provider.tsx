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

import {
  RainbowKitProvider,
  lightTheme,
  darkTheme,
  getDefaultWallets,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit";
import { useTheme } from "next-themes";
import type { ReactNode } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { injected, metaMask, walletConnect } from "wagmi/connectors";
// import { CHAINS } from "@/const/chains";

// -----------------------------------------------------------------------------
// Rainbow
// -----------------------------------------------------------------------------

const walletList = getDefaultWallets();

const connectors = connectorsForWallets(walletList.wallets, {
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,
  appName: "Light",
});

// -----------------------------------------------------------------------------
// Wagmi
// -----------------------------------------------------------------------------

// Set up wagmi config
export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,
    }),
    metaMask(),
    ...connectors,
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
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
