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

import { getNotifications } from "@lightdotso/client";
import type { NotificationData } from "@lightdotso/data";
import type { NotificationListParams } from "@lightdotso/params";
import { queryKeys } from "@lightdotso/query-keys";
import { useAuth } from "@lightdotso/stores";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const useQueryNotifications = (params: NotificationListParams) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { clientType } = useAuth();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const currentData: NotificationData[] | undefined = queryClient.getQueryData(
    queryKeys.notification.list({
      address: params.address,
      limit: params.limit,
      offset: params.offset,
    }).queryKey,
  );

  const { data: notifications, isLoading: isNotificationsLoading } = useQuery<
    NotificationData[] | null
  >({
    queryKey: queryKeys.notification.list({
      address: params.address,
      limit: params.limit,
      offset: params.offset,
    }).queryKey,
    queryFn: async () => {
      if (typeof params.address === "undefined") {
        return null;
      }

      const res = await getNotifications(
        {
          params: {
            query: {
              owner: params.address,
              limit: params.limit,
              offset: params.offset,
            },
          },
        },
        clientType,
      );

      // Return if the response is 200
      return res.match(
        data => {
          return data;
        },
        _ => {
          return currentData ?? null;
        },
      );
    },
  });

  return {
    notifications,
    isNotificationsLoading,
  };
};
