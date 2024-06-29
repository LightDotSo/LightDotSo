// Copyright 2023-2024 Light
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

import { FormDevTools } from "@lightdotso/forms";
import { AuthState, QueueState } from "@lightdotso/states";
import {
  Footer,
  ProgressTransaction,
  ProgressUserOperation,
} from "@lightdotso/templates";
import {
  TailwindIndicator,
  ThemeProvider,
  ReactQueryProvider,
  Toaster,
  VercelToolbar,
  Web3Provider,
} from "@lightdotso/ui";
import { cookieToInitialState, wagmiConfig } from "@lightdotso/wagmi";
import dynamic from "next/dynamic";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import Script from "next/script";
import type { FC, ReactNode } from "react";
import { AppBanner } from "@/components/app-banner";
import { MainNav } from "@/components/nav/main-nav";
import { WssState } from "@/components/wss/wss-state";

// -----------------------------------------------------------------------------
// Dynamic
// -----------------------------------------------------------------------------

const CommandK = dynamic(() => import("@/components/command-k"), {
  ssr: false,
});

const AddressModal = dynamic(
  () => import("@lightdotso/modals/src/address/address-modal"),
  {
    ssr: false,
  },
);

const AuthModal = dynamic(
  () => import("@lightdotso/modals/src/auth/auth-modal"),
  {
    ssr: false,
  },
);

const ChainModal = dynamic(
  () => import("@lightdotso/modals/src/chain/chain-modal"),
  {
    ssr: false,
  },
);

const ConnectModal = dynamic(
  () => import("@lightdotso/modals/src/connect/connect-modal"),
  {
    ssr: false,
  },
);

const OwnerModal = dynamic(
  () => import("@lightdotso/modals/src/owner/owner-modal"),
  {
    ssr: false,
  },
);

const NftModal = dynamic(() => import("@lightdotso/modals/src/nft/nft-modal"), {
  ssr: false,
});

const TokenModal = dynamic(
  () => import("@lightdotso/modals/src/token/token-modal"),
  {
    ssr: false,
  },
);

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface RootProps {
  children: ReactNode;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const Root: FC<RootProps> = ({ children }) => {
  const initialState = cookieToInitialState(
    wagmiConfig,
    headers().get("cookie"),
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <html
      suppressHydrationWarning
      lang="en"
      className={`${inter.variable} font-sans`}
    >
      <body className="min-h-dvh bg-background-body">
        <ThemeProvider attribute="class">
          <ReactQueryProvider showDevTools>
            <Web3Provider initialState={initialState}>
              {/* Banner */}
              <AppBanner />
              {/* Layout */}
              <MainNav>{children}</MainNav>
              <Footer />
              {/* Utility Functions */}
              <CommandK />
              <Toaster />
              {/* Modals */}
              <AddressModal />
              <AuthModal />
              <ChainModal />
              <ConnectModal />
              <OwnerModal />
              <NftModal />
              <TokenModal />
              {/* Templates */}
              <ProgressTransaction />
              <ProgressUserOperation />
              {/* States */}
              <AuthState />
              <QueueState />
              <WssState />
            </Web3Provider>
          </ReactQueryProvider>
        </ThemeProvider>
        {/* Dev */}
        <FormDevTools />
        <TailwindIndicator />
        <VercelToolbar />
      </body>
      <Script async src="https://data.light.so/p.js" />
    </html>
  );
};
