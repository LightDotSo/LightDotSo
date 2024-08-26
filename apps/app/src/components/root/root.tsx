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

import { AppBanner } from "@/components/app-banner";
import { Nav } from "@/components/nav/nav";
import { WalletState } from "@/components/state/wallet-state";
import { WssState } from "@/components/wss/wss-state";
import {
  AuthState,
  FormState,
  QueueState,
  UserOperationState,
} from "@lightdotso/states";
import {
  Footer,
  Root as LightRoot,
  ProgressTransaction,
  ProgressUserOperation,
} from "@lightdotso/templates";
import { Toaster, Web3Provider } from "@lightdotso/ui";
import { cookieToInitialState, wagmiConfig } from "@lightdotso/wagmi";
import dynamic from "next/dynamic";
import { headers } from "next/headers";
import type { FC, ReactNode } from "react";

// -----------------------------------------------------------------------------
// Dynamic
// -----------------------------------------------------------------------------

const CommandK = dynamic(() => import("@/components/command-k"), {
  ssr: false,
});

const AddressModal = dynamic(
  () => import("@lightdotso/modals/address/address-modal"),
  {
    ssr: false,
  },
);

const AuthModal = dynamic(() => import("@lightdotso/modals/auth/auth-modal"), {
  ssr: false,
});

const CartModal = dynamic(() => import("@lightdotso/modals/cart/cart-modal"), {
  ssr: false,
});

const ChainModal = dynamic(
  () => import("@lightdotso/modals/chain/chain-modal"),
  {
    ssr: false,
  },
);

const ConnectModal = dynamic(
  () => import("@lightdotso/modals/connect/connect-modal"),
  {
    ssr: false,
  },
);

const OwnerModal = dynamic(
  () => import("@lightdotso/modals/owner/owner-modal"),
  {
    ssr: false,
  },
);

const NftModal = dynamic(() => import("@lightdotso/modals/nft/nft-modal"), {
  ssr: false,
});

const TokenModal = dynamic(
  () => import("@lightdotso/modals/token/token-modal"),
  {
    ssr: false,
  },
);

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
    <LightRoot>
      <Web3Provider initialState={initialState}>
        {/* Banner */}
        <AppBanner />
        {/* Layout */}
        <Nav>{children}</Nav>
        <Footer />
        {/* Utility Functions */}
        <CommandK />
        <Toaster />
        {/* Modals */}
        <AddressModal />
        <AuthModal />
        <CartModal />
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
        <FormState />
        <QueueState />
        <UserOperationState />
        <WalletState />
        <WssState />
      </Web3Provider>
    </LightRoot>
  );
};
