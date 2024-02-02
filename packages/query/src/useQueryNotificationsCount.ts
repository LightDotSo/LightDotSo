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

import { getNotificationsCount } from "@lightdotso/client";
import type { NotificationCountData } from "@lightdotso/data";
import type { NotificationListCountParams } from "@lightdotso/params";
import { queryKeys } from "@lightdotso/query-keys";
import { useAuth } from "@lightdotso/stores";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Address } from "viem";

export const useQueryNotificationsCount = (
  params: NotificationListCountParams,
) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { clientType } = useAuth();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const currentCountData: NotificationCountData | undefined =
    queryClient.getQueryData(
      queryKeys.notification.listCount({ address: params.address as Address })
        .queryKey,
    );

  const {
    data: notificationsCount,
    isLoading: isNotificationsCountLoading,
    failureCount,
  } = useQuery<NotificationCountData | null>({
    queryKey: queryKeys.notification.listCount({
      address: params.address as Address,
    }).queryKey,
    queryFn: async () => {
      if (typeof params.address === "undefined") {
        return null;
      }

      const res = await getNotificationsCount(
        {
          params: {
            query: {
              owner: params.address,
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
          return currentCountData ?? null;
        },
      );
    },
  });

  return {
    notificationsCount,
    isNotificationsCountLoading,
  };
};
