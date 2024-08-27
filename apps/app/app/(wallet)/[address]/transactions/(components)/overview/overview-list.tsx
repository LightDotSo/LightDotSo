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

import { DataTable } from "@/app/(wallet)/[address]/transactions/(components)/data-table/data-table";
import {
  OverviewSection,
  OverviewSectionSkeleton,
} from "@/app/(wallet)/[address]/transactions/(components)/overview/overview-section";
import { OverviewSectionEmpty } from "@/app/(wallet)/[address]/transactions/(components)/overview/overview-section-empty";
import { TransactionsDataTable } from "@/app/(wallet)/[address]/transactions/(components)/transactions-data-table";
import type { FC } from "react";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export type OverviewListProps = {
  address: Address | null;
  isDemo?: boolean;
  isLoading?: boolean;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const OverviewList: FC<OverviewListProps> = ({
  address,
  isDemo = false,
  isLoading = false,
}) => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (isLoading || !address) {
    return (
      <>
        <OverviewSectionSkeleton>
          <DataTable
            isLoading
            address={null}
            data={[]}
            pageCount={0}
            columns={[]}
            isTestnet={false}
          />
        </OverviewSectionSkeleton>
        <OverviewSectionSkeleton>
          <DataTable
            isLoading
            address={null}
            data={[]}
            pageCount={0}
            columns={[]}
            isTestnet={false}
          />
        </OverviewSectionSkeleton>
      </>
    );
  }

  return (
    <>
      <OverviewSection
        address={address as Address}
        status="queued"
        title="Queue"
        href={`/${isDemo ? "demo" : address}/transactions/queue`}
      >
        <TransactionsDataTable address={address as Address} status="queued" />
      </OverviewSection>
      <OverviewSection
        address={address as Address}
        status="history"
        title="History"
        href={`/${isDemo ? "demo" : address}/transactions/history`}
      >
        <TransactionsDataTable address={address as Address} status="history" />
      </OverviewSection>
      <OverviewSectionEmpty address={address as Address} />
    </>
  );
};
