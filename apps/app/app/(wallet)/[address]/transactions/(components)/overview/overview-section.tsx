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

"use client";

import type { UserOperationData, WalletSettingsData } from "@lightdotso/data";
import { queryKeys } from "@lightdotso/query-keys";
import { Button } from "@lightdotso/ui";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface OverviewSectionProps {
  address: Address;
  status: "queued" | "history";
  href: string;
  title: string;
  children: ReactNode;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const OverviewSection = ({
  address,
  status,
  href,
  children,
  title,
}: OverviewSectionProps) => {
  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const walletSettings: WalletSettingsData | undefined =
    queryClient.getQueryData(queryKeys.wallet.settings({ address }).queryKey);

  const currentData: UserOperationData[] | undefined = queryClient.getQueryData(
    queryKeys.user_operation.list({
      address,
      status,
      order: status === "queued" ? "asc" : "desc",
      limit: 10,
      offset: 0,
      is_testnet: walletSettings?.is_enabled_testnet ?? false,
    }).queryKey,
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (!currentData || currentData.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center">
          <div className="text-xl font-semibold text-text-primary">{title}</div>
        </div>
        <div className="flex items-center space-x-3">
          <Button asChild size="sm" variant="outline">
            <Link href={href}>
              See All
              <ChevronRightIcon className="ml-2 size-3" />
            </Link>
          </Button>
        </div>
      </div>
      {children}
    </div>
  );
};
