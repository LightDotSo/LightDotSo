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

import { OverviewInvokeButton } from "@/app/(wallet)/[address]/transactions/(components)/overview/overview-invoke-button";
import { LinkButtonGroup } from "@/components/section/link-button-group";
import { TITLES } from "@/const";
import { BannerSection } from "@lightdotso/ui/sections";
import {
  BaseLayerWrapper,
  BasicPageWrapper,
  MiddleLayerWrapper,
} from "@lightdotso/ui/wrappers";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const transactionsNavItems = [
  {
    title: "All",
    href: "/transactions",
    id: "transactions",
  },
  {
    title: "Queue",
    href: "/transactions/queue",
    id: "queue",
  },
  {
    title: "History",
    href: "/transactions/history",
    id: "history",
  },
];

// -----------------------------------------------------------------------------
// Metadata
// -----------------------------------------------------------------------------

export const metadata: Metadata = {
  title: TITLES.Transactions.title,
  description: TITLES.Transactions.description,
};

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface TransactionsLayoutProps {
  children: ReactNode;
  nav: ReactNode;
  params: {
    address: string;
  };
}

// -----------------------------------------------------------------------------
// Layout
// -----------------------------------------------------------------------------

export default function TransactionsLayout({
  children,
  nav,
  params,
}: TransactionsLayoutProps) {
  return (
    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    <>
      <BannerSection
        title={TITLES.Transactions.title}
        description={TITLES.Transactions.description}
      >
        <MiddleLayerWrapper>
          <LinkButtonGroup items={transactionsNavItems}>
            {nav}
            <OverviewInvokeButton address={params.address as Address} />
          </LinkButtonGroup>
        </MiddleLayerWrapper>
      </BannerSection>
      <BaseLayerWrapper>
        <BasicPageWrapper>{children}</BasicPageWrapper>
      </BaseLayerWrapper>
    </>
  );
}

// -----------------------------------------------------------------------------
// Data
// -----------------------------------------------------------------------------

export const revalidate = 300;
