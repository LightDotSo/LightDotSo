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

"use client";

// From: https://github.com/vercel/next.js/issues/49454
// Wrap `next/dynamic` in `use client` to avoid Next.js server-side rendering

import dynamic from "next/dynamic";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Dynamic Modals
// -----------------------------------------------------------------------------

const AddressModal = dynamic(
  () =>
    import("@lightdotso/modals/address").then((mod) => ({
      default: mod.AddressModal,
    })),
  {
    ssr: false,
  },
);

const AuthModal = dynamic(
  () =>
    import("@lightdotso/modals/auth").then((mod) => ({
      default: mod.AuthModal,
    })),
  {
    ssr: false,
  },
);

const CartModal = dynamic(
  () =>
    import("@lightdotso/modals/cart").then((mod) => ({
      default: mod.CartModal,
    })),
  {
    ssr: false,
  },
);

const ChainModal = dynamic(
  () =>
    import("@lightdotso/modals/chain").then((mod) => ({
      default: mod.ChainModal,
    })),
  {
    ssr: false,
  },
);

const ConnectModal = dynamic(
  () =>
    import("@lightdotso/modals/connect").then((mod) => ({
      default: mod.ConnectModal,
    })),
  {
    ssr: false,
  },
);

const OwnerModal = dynamic(
  () =>
    import("@lightdotso/modals/owner").then((mod) => ({
      default: mod.OwnerModal,
    })),
  {
    ssr: false,
  },
);

const NftModal = dynamic(
  () =>
    import("@lightdotso/modals/nft").then((mod) => ({
      default: mod.NftModal,
    })),
  {
    ssr: false,
  },
);

const TokenModal = dynamic(
  () =>
    import("@lightdotso/modals/token").then((mod) => ({
      default: mod.TokenModal,
    })),
  {
    ssr: false,
  },
);

// -----------------------------------------------------------------------------
// Dynamic States
// -----------------------------------------------------------------------------

const AuthState = dynamic(
  () =>
    import("@lightdotso/states/auth").then((mod) => ({
      default: mod.AuthState,
    })),
  {
    ssr: false,
  },
);

const FormState = dynamic(
  () =>
    import("@lightdotso/states/form").then((mod) => ({
      default: mod.FormState,
    })),
  {
    ssr: false,
  },
);

const QueueState = dynamic(
  () =>
    import("@lightdotso/states/queue").then((mod) => ({
      default: mod.QueueState,
    })),
  {
    ssr: false,
  },
);

const UserOperationState = dynamic(
  () =>
    import("@lightdotso/states/user-operation").then((mod) => ({
      default: mod.UserOperationState,
    })),
  {
    ssr: false,
  },
);

// -----------------------------------------------------------------------------
// Dynamic Templates
// -----------------------------------------------------------------------------

const ProgressTransaction = dynamic(
  () =>
    import("@lightdotso/templates/progress-transaction").then((mod) => ({
      default: mod.ProgressTransaction,
    })),
  {
    ssr: false,
  },
);

const ProgressUserOperation = dynamic(
  () =>
    import("@lightdotso/templates/progress-user-operation").then((mod) => ({
      default: mod.ProgressUserOperation,
    })),
  {
    ssr: false,
  },
);

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const LightRootWrapper: FC = () => {
  return (
    <>
      {/* Modals */}
      <AddressModal />
      <AuthModal />
      <CartModal />
      <ChainModal />
      <ConnectModal />
      <OwnerModal />
      <NftModal />
      <TokenModal />
      {/* States */}
      <AuthState />
      <FormState />
      <QueueState />
      <UserOperationState />
      {/* Templates */}
      <ProgressTransaction />
      <ProgressUserOperation />
    </>
  );
};
