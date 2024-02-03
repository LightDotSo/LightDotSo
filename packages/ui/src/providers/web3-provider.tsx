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

import type { State } from "@lightdotso/wagmi";
import { WagmiProvider, wagmiConfig } from "@lightdotso/wagmi";
import { ConnectKitProvider } from "connectkit";
import { useTheme } from "next-themes";
import { type ReactNode } from "react";

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

  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      <ConnectKitProvider
        mode={theme === "system" ? "auto" : theme === "dark" ? "dark" : "light"}
      >
        {children}
      </ConnectKitProvider>
    </WagmiProvider>
  );
}

export { Web3Provider };
