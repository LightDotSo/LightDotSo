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

import { getWalletNotificationSettings } from "@lightdotso/client";
import type { WalletNotificationSettingsData } from "@lightdotso/data";
import type { WalletSettingsParams } from "@lightdotso/params";
import { queryKeys } from "@lightdotso/query-keys";
import { useAuth } from "@lightdotso/stores";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

export const useQueryWalletNotificationSettings = (
  params: WalletSettingsParams,
) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { clientType } = useAuth();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const currentData: WalletNotificationSettingsData | undefined =
    queryClient.getQueryData(
      queryKeys.wallet.notificationSettings({ address: params.address })
        .queryKey,
    );

  const { data: walletNotificationSettings, failureCount } =
    useQuery<WalletNotificationSettingsData | null>({
      queryKey: queryKeys.wallet.notificationSettings({
        address: params.address,
      }).queryKey,
      queryFn: async () => {
        if (typeof params.address === "undefined") {
          return null;
        }

        const res = await getWalletNotificationSettings(
          {
            params: {
              query: {
                address: params.address,
              },
            },
          },
          clientType,
        );

        return res.match(
          data => {
            return data;
          },
          err => {
            if (failureCount % 3 !== 2) {
              throw err;
            }
            return currentData ?? null;
          },
        );
      },
    });

  return {
    walletNotificationSettings,
  };
};
