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

import { Loading } from "@/app/(wallet)/[address]/op/[userOperationHash]/loading";
import type { PageProps as OpPageProps } from "@/app/(wallet)/[address]/op/[userOperationHash]/page";
import type { WalletSettingsData } from "@lightdotso/data";
import dynamic from "next/dynamic";
import type { Hex } from "viem";

// -----------------------------------------------------------------------------
// Dynamic
// -----------------------------------------------------------------------------

const OpDataTable = dynamic(
  () =>
    import(
      "@/app/(wallet)/[address]/op/[userOperationHash]/(components)/op-data-table"
    ).then((mod) => mod.OpDataTable),
  {
    loading: () => <Loading />,
    ssr: false,
  },
);

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export type PageProps = OpPageProps & {
  walletSettings: WalletSettingsData;
};

// -----------------------------------------------------------------------------
// Loader
// -----------------------------------------------------------------------------

export function Loader({ params, walletSettings }: PageProps) {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <OpDataTable
      userOperationHash={params.userOperationHash as Hex}
      walletSettings={walletSettings}
    />
  );
}