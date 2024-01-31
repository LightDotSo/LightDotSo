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
import type { State } from "@lightdotso/wagmi";
import {
  WagmiProvider,
  projectId,
  wagmiConfig,
  createWeb3Modal,
} from "@lightdotso/wagmi";
import { useTheme } from "next-themes";
import { useState, type ReactNode, useEffect, useMemo } from "react";

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
  // State Hooks
  // ---------------------------------------------------------------------------

  const [web3Modal, setWeb3Modal] = useState<any | null | undefined>(undefined);

  // ---------------------------------------------------------------------------
  // Operation Hooks
  // ---------------------------------------------------------------------------

  const { theme } = useTheme();

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const modal = useMemo(() => {
    if (process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID === undefined) {
      return null;
    }

    const modal = createWeb3Modal({
      // @ts-expect-error
      chains: CHAINS,
      wagmiConfig,
      projectId,
      themeMode: theme === "light" ? "light" : "dark",
    });
    return modal;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // Web3Modal
  // ---------------------------------------------------------------------------

  useEffect(() => {
    setWeb3Modal(modal);
  }, [modal]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (typeof web3Modal === "undefined") {
    return null;
  }

  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      {children}
    </WagmiProvider>
  );
}

export { Web3Provider };
