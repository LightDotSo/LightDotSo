// Copyright (C) 2023 Light, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import type { Metadata } from "next";
import type { Address } from "viem";
import { InvokeUserOperationButton } from "@/app/(wallet)/[address]/transactions/(components)/invoke-user-operation-button";
import { TransactionsDataTableToolbar } from "@/app/(wallet)/[address]/transactions/(components)/transactions-data-table-toolbar";
import { BannerSection } from "@/components/section/banner-section";
import { LinkButtonGroup } from "@/components/section/link-button-group";
import { BaseLayerWrapper } from "@/components/wrapper/layer/base-layer-wrapper";
import { MiddleLayerWrapper } from "@/components/wrapper/layer/middle-layer-wrapper";
import { BasicPageWrapper } from "@/components/wrapper/page/basic-page-wrapper";
import { TITLES } from "@/const/titles";

// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

const transactionsNavItems = [
  {
    title: "Queue",
    href: "/transactions",
    id: "transactions",
  },
  {
    title: "All",
    href: "/transactions/all",
    id: "all",
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
  children: React.ReactNode;
  params: {
    address: string;
  };
}

// -----------------------------------------------------------------------------
// Layout
// -----------------------------------------------------------------------------

export default function TransactionsLayout({
  children,
  params,
}: TransactionsLayoutProps) {
  return (
    <>
      <BannerSection
        title={TITLES.Transactions.title}
        description={TITLES.Transactions.description}
      >
        <MiddleLayerWrapper>
          <LinkButtonGroup items={transactionsNavItems}>
            <TransactionsDataTableToolbar />
            <InvokeUserOperationButton address={params.address as Address} />
          </LinkButtonGroup>
        </MiddleLayerWrapper>
      </BannerSection>
      <BaseLayerWrapper>
        <BasicPageWrapper>{children}</BasicPageWrapper>
      </BaseLayerWrapper>
    </>
  );
}
