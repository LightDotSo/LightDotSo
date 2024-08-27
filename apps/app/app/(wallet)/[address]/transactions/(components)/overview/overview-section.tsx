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

import {
  useQueryUserOperations,
  useQueryWalletSettings,
} from "@lightdotso/query";
import { Button, Skeleton } from "@lightdotso/ui";
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

  const { walletSettings } = useQueryWalletSettings({
    address: address as Address,
  });

  const { userOperations } = useQueryUserOperations({
    address: address as Address,
    status: status,
    order: status === "queued" ? "asc" : "desc",
    limit: 10,
    offset: 0,
    // biome-ignore lint/style/useNamingConvention: <explanation>
    is_testnet: walletSettings?.is_enabled_testnet ?? false,
  });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (!userOperations || userOperations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center">
          <div className="font-semibold text-text-primary text-xl">{title}</div>
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

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const OverviewSectionSkeleton = ({
  children,
}: { children: ReactNode }) => {
  return (
    <div className="space-y-4">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center">
          <Skeleton className="h-7 w-40" />
        </div>
        <div className="flex items-center space-x-3">
          <Button size="sm" variant="outline" disabled>
            See All
            <ChevronRightIcon className="ml-2 size-3" />
          </Button>
        </div>
      </div>
      {children}
    </div>
  );
};
