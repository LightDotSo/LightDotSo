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

import { ACTION_NAV_ITEMS } from "@/app/(action)/(const)/nav-items";
import { BaseLayout } from "@/app/(action)/(layouts)/base-layout";
import { IntroLayout } from "@/app/(action)/(layouts)/intro-layout";
import { Loader } from "@/app/(action)/deposit/loader";
import { LinkButtonGroup } from "@/components/section/link-button-group";
import { TITLES } from "@/const";
import type { Metadata } from "next";

// -----------------------------------------------------------------------------
// Metadata
// -----------------------------------------------------------------------------

export const metadata: Metadata = {
  title: TITLES.Deposit.title,
  description: TITLES.Deposit.description,
};

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface PageProps {
  searchParams: Promise<{
    intro?: boolean;
  }>;
}

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default async function Page({ searchParams }: PageProps) {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if ((await searchParams).intro) {
    return (
      <IntroLayout>
        <LinkButtonGroup items={ACTION_NAV_ITEMS} />
        <Loader />
      </IntroLayout>
    );
  }

  return (
    <BaseLayout>
      <LinkButtonGroup items={ACTION_NAV_ITEMS} />
      <Loader />
    </BaseLayout>
  );
}
