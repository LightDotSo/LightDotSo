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

import dynamic from "next/dynamic";
import type { Address } from "viem";
import type { PageProps } from "./page";

// -----------------------------------------------------------------------------
// Dynamic
// -----------------------------------------------------------------------------

const SettingsNameCard = dynamic(
  () =>
    import(
      "@/app/(wallet)/[address]/settings/(components)/settings-name-card"
    ).then((mod) => mod.SettingsNameCard),
  {
    ssr: false,
  },
);

const SettingsDevCard = dynamic(
  () =>
    import(
      "@/app/(wallet)/[address]/settings/(components)/settings-dev-card"
    ).then((mod) => mod.SettingsDevCard),
  {
    ssr: false,
  },
);

const SettingsTestnetCard = dynamic(
  () =>
    import(
      "@/app/(wallet)/[address]/settings/(components)/settings-testnet-card"
    ).then((mod) => mod.SettingsTestnetCard),
  {
    ssr: false,
  },
);

// -----------------------------------------------------------------------------
// Loader
// -----------------------------------------------------------------------------

export function Loader({ params }: { params: PageProps["params"] }) {
  return (
    <>
      <SettingsNameCard address={params.address as Address} />
      <SettingsDevCard address={params.address as Address} />
      <SettingsTestnetCard address={params.address as Address} />
    </>
  );
}
