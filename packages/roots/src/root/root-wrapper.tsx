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
// Dynamic UI
// -----------------------------------------------------------------------------

const Toaster = dynamic(
  () => import("@lightdotso/ui/components/toast").then((mod) => mod.Toaster),
  {
    ssr: false,
  },
);

// -----------------------------------------------------------------------------
// Dynamic Modals
// -----------------------------------------------------------------------------

const AddressModal = dynamic(
  () => import("@lightdotso/modals/address").then((mod) => mod.AddressModal),
  {
    ssr: false,
  },
);

const AuthModal = dynamic(
  () => import("@lightdotso/modals/auth").then((mod) => mod.AuthModal),
  {
    ssr: false,
  },
);

const CartModal = dynamic(
  () => import("@lightdotso/modals/cart").then((mod) => mod.CartModal),
  {
    ssr: false,
  },
);

const ChainModal = dynamic(
  () => import("@lightdotso/modals/chain").then((mod) => mod.ChainModal),
  {
    ssr: false,
  },
);

const ConnectModal = dynamic(
  () => import("@lightdotso/modals/connect").then((mod) => mod.ConnectModal),
  {
    ssr: false,
  },
);

const OwnerModal = dynamic(
  () => import("@lightdotso/modals/owner").then((mod) => mod.OwnerModal),
  {
    ssr: false,
  },
);

const NftModal = dynamic(
  () => import("@lightdotso/modals/nft").then((mod) => mod.NftModal),
  {
    ssr: false,
  },
);

const TokenModal = dynamic(
  () => import("@lightdotso/modals/token").then((mod) => mod.TokenModal),
  {
    ssr: false,
  },
);

// -----------------------------------------------------------------------------
// Dynamic States
// -----------------------------------------------------------------------------

const AuthState = dynamic(
  () => import("@lightdotso/states/auth").then((mod) => mod.AuthState),
  {
    ssr: false,
  },
);

const FormState = dynamic(
  () => import("@lightdotso/states/form").then((mod) => mod.FormState),
  {
    ssr: false,
  },
);

const QueueState = dynamic(
  () => import("@lightdotso/states/queue").then((mod) => mod.QueueState),
  {
    ssr: false,
  },
);

const UserOperationState = dynamic(
  () =>
    import("@lightdotso/states/user-operation").then(
      (mod) => mod.UserOperationState,
    ),
  {
    ssr: false,
  },
);

// -----------------------------------------------------------------------------
// Dynamic Templates
// -----------------------------------------------------------------------------

const ProgressTransaction = dynamic(
  () =>
    import("@lightdotso/templates/progress-transaction").then(
      (mod) => mod.ProgressTransaction,
    ),
  {
    ssr: false,
  },
);

const ProgressUserOperation = dynamic(
  () =>
    import("@lightdotso/templates/progress-user-operation").then(
      (mod) => mod.ProgressUserOperation,
    ),
  {
    ssr: false,
  },
);

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const RootWrapper: FC = () => {
  return (
    <>
      {/* UI */}
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
