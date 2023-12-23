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

// Full complete example from: https://github.com/hqasmei/youtube-tutorials/blob/ee44df8fbf6ab4f4c2f7675f17d67813947a7f61/vercel-animated-tabs/src/hooks/use-tabs.tsx
// License: MIT

import { getConfiguration, getUserOperationsCount } from "@lightdotso/client";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import type { Address } from "viem";
import type {
  ConfigurationData,
  UserOperationCountData,
  WalletSettingsData,
} from "@/data";
import { queries } from "@/queries";
import { useAuth } from "@/stores";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type Tab = {
  label: string;
  id: string;
  href: string;
  number: number;
  icon: (_props: { className?: string }) => ReactNode;
};

export type RawTab = Omit<Tab, "number">;
// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export function useTabs({ tabs }: { tabs: RawTab[] }) {
  const pathname = usePathname();
  const { wallet: walletAddress } = useAuth();
  const tabIds = tabs.map(tab => tab.id);

  // The index of the selected tab
  const [selectedTabIndex, setSelectedTabIndex] = useState<number | undefined>(
    undefined,
  );

  // Set the initialTabId to the matching slug in tabIds array
  useEffect(() => {
    // Split the path using '/' as delimiter and remove empty strings
    const slugs = pathname.split("/").filter(slug => slug);
    const replacedSlugs = slugs.map(slug =>
      slug
        // Replace occurences of 'op' with 'transactions'
        .replace("op", "transactions")
        // Replace occurences of 'send' with 'transactions'
        .replace("send", "transactions"),
    );
    // Get the matching slug in tabIds array
    const matchingId = tabIds.find(slug => replacedSlugs.includes(slug));

    // Set the mount id
    const mountId = matchingId || "overview";
    // Set the initialTabId to the mount id
    const indexOfInitialTab = tabs.findIndex(tab => tab.id === mountId);
    // Set the initial tab
    setSelectedTabIndex(indexOfInitialTab === -1 ? 0 : indexOfInitialTab);
    // Only run on initial render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const walletSettings: WalletSettingsData | undefined =
    queryClient.getQueryData(
      queries.wallet.settings({ address: walletAddress as Address }).queryKey,
    );

  const currentConfigurationData: ConfigurationData | undefined =
    queryClient.getQueryData(
      queries.configuration.get({ address: walletAddress as Address }).queryKey,
    );

  const { data: configuration } = useSuspenseQuery<ConfigurationData | null>({
    queryKey: queries.configuration.get({ address: walletAddress as Address })
      .queryKey,
    queryFn: async () => {
      if (!walletAddress) {
        return null;
      }

      const res = await getConfiguration({
        params: {
          query: {
            address: walletAddress,
          },
        },
      });

      // Return if the response is 200
      return res.match(
        data => {
          return data;
        },
        _ => {
          return currentConfigurationData ?? null;
        },
      );
    },
  });

  const currentUserOperationCountData: UserOperationCountData | undefined =
    queryClient.getQueryData(
      queries.user_operation.listCount({
        address: walletAddress as Address,
        status: "proposed",
        is_testnet: walletSettings?.is_enabled_testnet ?? false,
      }).queryKey,
    );

  const { data: userOperationCount } =
    useSuspenseQuery<UserOperationCountData | null>({
      queryKey: queries.user_operation.listCount({
        address: walletAddress as Address,
        status: "proposed",
        is_testnet: walletSettings?.is_enabled_testnet ?? false,
      }).queryKey,
      queryFn: async () => {
        if (!walletAddress) {
          return null;
        }

        const res = await getUserOperationsCount({
          params: {
            query: {
              address: walletAddress,
              status: "proposed",
              is_testnet: walletSettings?.is_enabled_testnet ?? false,
            },
          },
        });

        // Return if the response is 200
        return res.match(
          data => {
            return data;
          },
          _ => {
            return currentUserOperationCountData ?? null;
          },
        );
      },
    });

  // Inside useTabs function
  const transformedTabs: Tab[] = useMemo(() => {
    if (!configuration || !userOperationCount) {
      return tabs.map(tab => ({ ...tab, number: 0 }));
    }

    return tabs.map(tab => {
      let number = 0;
      if (tab.id === "owners") {
        number = configuration.owners.length;
      } else if (tab.id === "transactions") {
        number = userOperationCount.count;
      }
      // else if (tab.id === "activity") {
      //   number = data.transaction_count;
      // }
      return { ...tab, number };
    });
  }, [configuration, userOperationCount, tabs]);

  return {
    tabProps: {
      tabs: transformedTabs,
      selectedTabIndex,
      setSelectedTabIndex,
    },
    selectedTab: selectedTabIndex !== undefined ? tabs[selectedTabIndex] : null,
    contentProps: {
      direction: 0,
      selectedTabIndex,
    },
  };
}
