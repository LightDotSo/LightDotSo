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

import type { WagmiConfigProps } from "wagmi";
import { WagmiConfig, createConfig } from "wagmi";
import type { SIWEConfig } from "connectkit";
import { ConnectKitProvider, SIWEProvider, getDefaultConfig } from "connectkit";
import { ReactQueryStreamedHydration } from "@tanstack/react-query-next-experimental";
import { mainnet, sepolia } from "wagmi/chains";

const config = createConfig(
  getDefaultConfig({
    appName: "Light",
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,
    chains: [mainnet, sepolia],
  }),
);

export function Web3Provider({
  children,
  wagmiConfig = config,
  siweConfig,
}: {
  children: React.ReactNode;
  wagmiConfig?: WagmiConfigProps["config"];
  siweConfig: SIWEConfig;
}) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <SIWEProvider {...siweConfig} signOutOnNetworkChange={false}>
        <ConnectKitProvider>
          <ReactQueryStreamedHydration>{children}</ReactQueryStreamedHydration>
        </ConnectKitProvider>
      </SIWEProvider>
    </WagmiConfig>
  );
}
