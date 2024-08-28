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
import { Footer, Root as LightRoot } from "@lightdotso/templates";
import dynamic from "next/dynamic";
import type { FC, ReactNode } from "react";

// -----------------------------------------------------------------------------
// Dynamic
// -----------------------------------------------------------------------------

const Web3Provider = dynamic(
  () => import("@lightdotso/ui").then((mod) => mod.Web3Provider),
  {
    ssr: false,
  },
);

const CommandK = dynamic(() => import("@/components/command-k"), {
  ssr: false,
});

const Toaster = dynamic(
  () => import("@lightdotso/ui").then((mod) => mod.Toaster),
  {
    ssr: false,
  },
);

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

const ProgressTransaction = dynamic(
  () => import("@lightdotso/templates").then((mod) => mod.ProgressTransaction),
  {
    ssr: false,
  },
);

const ProgressUserOperation = dynamic(
  () =>
    import("@lightdotso/templates").then((mod) => mod.ProgressUserOperation),
  {
    ssr: false,
  },
);

const AuthState = dynamic(
  () => import("@lightdotso/states").then((mod) => mod.AuthState),
  {
    ssr: false,
  },
);

const FormState = dynamic(
  () => import("@lightdotso/states").then((mod) => mod.FormState),
  {
    ssr: false,
  },
);

const QueueState = dynamic(() =>
  import("@lightdotso/states").then((mod) => mod.QueueState),
);

const UserOperationState = dynamic(
  () => import("@lightdotso/states").then((mod) => mod.UserOperationState),
  {
    ssr: false,
  },
);

const WalletState = dynamic(
  () =>
    import("@/components/state/wallet-state").then((mod) => mod.WalletState),
  {
    ssr: false,
  },
);

const WssState = dynamic(
  () => import("@/components/wss/wss-state").then((mod) => mod.WssState),
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
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <LightRoot>
      <Web3Provider>
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
