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
import { RadiobuttonIcon } from "@radix-ui/react-icons";
import type { IconProps } from "@radix-ui/react-icons/dist/types";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import type { RefAttributes } from "react";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

const aiTab = {
  label: "AI",
  id: "ai",
  href: "/ai",
  icon: (
    props: JSX.IntrinsicAttributes & IconProps & RefAttributes<SVGSVGElement>,
  ) => <RadiobuttonIcon {...props} />,
};

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export function useTabs({ tabs }: { tabs: Tab[] }) {
  // ---------------------------------------------------------------------------
  // Next Hooks
  // ---------------------------------------------------------------------------

  const pathname = usePathname();

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { wallet: walletAddress } = useAuth();

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
    if (!configuration || !userOperationsCount) {
      return tabs.map(tab => ({ ...tab, number: 0 }));
    }

    if (walletFeatures?.is_enabled_ai) {
      // If AI not yet in tabs, add it
      if (!tabs.find(tab => tab.id === aiTab.id)) {
        // Add it after the id `activity`
        const indexOfTransactions = tabs.findIndex(
          tab => tab.id === "activity",
        );
        tabs.splice(indexOfTransactions + 1, 0, aiTab);
      }
    }

    return tabs.map(tab => {
      let number = 0;
      if (tab.id === "owners") {
        number = configuration.owners.length;
      } else if (tab.id === "transactions") {
        number = userOperationsCount.count;
      }
      // else if (tab.id === "activity") {
      //   number = data.transaction_count;
      // }
      return { ...tab, number };
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
