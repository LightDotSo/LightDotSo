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

import { SettingsCardSkeleton } from "@/components/settings/settings-card";
import dynamic from "next/dynamic";
import type { Address } from "viem";
import type { PageProps as OriginalPageProps } from "./page";

// -----------------------------------------------------------------------------
// Dynamic
// -----------------------------------------------------------------------------

const SettingsNameCard = dynamic(
  () =>
    import(
      "@/app/(wallet)/[address]/settings/(components)/settings-name-card"
    ).then((mod) => ({
      default: mod.SettingsNameCard,
    })),
  {
    ssr: false,
    loading: () => <SettingsCardSkeleton />,
  },
);

const SettingsDevCard = dynamic(
  () =>
    import(
      "@/app/(wallet)/[address]/settings/(components)/settings-dev-card"
    ).then((mod) => mod.SettingsDevCard),
  {
    ssr: false,
    loading: () => <SettingsCardSkeleton />,
  },
);

const SettingsTestnetCard = dynamic(
  () =>
    import(
      "@/app/(wallet)/[address]/settings/(components)/settings-testnet-card"
    ).then((mod) => mod.SettingsTestnetCard),
  {
    ssr: false,
    loading: () => <SettingsCardSkeleton />,
  },
);

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type PageProps = {
  params: Awaited<OriginalPageProps["params"]>;
};

// -----------------------------------------------------------------------------
// Loader
// -----------------------------------------------------------------------------

export function Loader({ params: { address } }: PageProps) {
  return (
    <>
      <SettingsNameCard address={address as Address} />
      <SettingsDevCard address={address as Address} />
      <SettingsTestnetCard address={address as Address} />
    </>
  );
}
