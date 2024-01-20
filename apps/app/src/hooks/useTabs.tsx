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

import type { WalletSettingsData } from "@lightdotso/data";
import {
  useQueryUserOperationsCount,
  useSuspenseQueryConfiguration,
  useSuspenseQueryWalletFeatures,
} from "@lightdotso/query";
import { queryKeys } from "@lightdotso/query-keys";
import { useAuth } from "@lightdotso/stores";
import type { Tab } from "@lightdotso/types";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import type { Address } from "viem";
import { usePathType } from "./usePathType";
import { AI_TAB, DEFAULT_TABS } from "@/const";

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export function useTabs() {
  // ---------------------------------------------------------------------------
  // Next Hooks
  // ---------------------------------------------------------------------------

  const pathname = usePathname();

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { wallet: walletAddress } = useAuth();

  // ---------------------------------------------------------------------------
  // Operation Hooks
  // ---------------------------------------------------------------------------

  const pathType = usePathType();

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const tabs = useMemo(() => {
    if (pathType === "demo") {
      return DEFAULT_TABS.filter(tab => {
        // Don't return `settings` and `support` tabs
        return tab.id !== "settings" && tab.id !== "support";
      });
    }
    return DEFAULT_TABS;
  }, [pathType]);

  // ---------------------------------------------------------------------------
  // Local Variables
  // ---------------------------------------------------------------------------

  const tabIds = tabs.map(tab => tab.id);

  // ---------------------------------------------------------------------------
  // State Hooks
  // ---------------------------------------------------------------------------

  // The index of the selected tab
  const [selectedTabIndex, setSelectedTabIndex] = useState<number | undefined>(
    undefined,
  );

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

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
      queryKeys.wallet.settings({ address: walletAddress as Address }).queryKey,
    );

  const { configuration } = useSuspenseQueryConfiguration({
    address: walletAddress as Address,
  });

  const { walletFeatures } = useSuspenseQueryWalletFeatures({
    address: walletAddress as Address,
  });

  const { userOperationsCount } = useQueryUserOperationsCount({
    address: walletAddress as Address,
    status: "proposed",
    is_testnet: walletSettings?.is_enabled_testnet ?? false,
  });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  // Inside useTabs function
  const transformedTabs: Tab[] = useMemo(() => {
    if (walletFeatures?.is_enabled_ai) {
      // If AI not yet in tabs, add it
      if (!tabs.find(tab => tab.id === AI_TAB.id)) {
        // Add it after the id `activity`
        const indexOfTransactions = tabs.findIndex(
          tab => tab.id === "activity",
        );
        tabs.splice(indexOfTransactions + 1, 0, AI_TAB);
      }
    }

    return tabs.map(tab => {
      if (tab.id === "owners") {
        if (configuration?.owners) {
          tab.number = configuration.owners.length;
        }
      } else if (tab.id === "transactions") {
        if (userOperationsCount?.count && userOperationsCount?.count !== 0) {
          tab.number = userOperationsCount?.count;
        }
      }
      // else if (tab.id === "activity") {
      //   number = data.transaction_count;
      // }
      return tab;
    });
  }, [configuration, userOperationsCount, walletFeatures?.is_enabled_ai, tabs]);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    tabProps: {
      tabs: transformedTabs,
      selectedTabIndex,
      setSelectedTabIndex,
    },
    selectedTab: selectedTabIndex !== undefined ? tabs[selectedTabIndex] : null,
    contentProps: {
      order: 0,
      selectedTabIndex,
    },
  };
}
