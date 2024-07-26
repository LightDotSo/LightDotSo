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

import { getNotificationsCount } from "@lightdotso/client";
import type { NotificationCountData } from "@lightdotso/data";
import type { NotificationListCountParams } from "@lightdotso/params";
import { queryKeys } from "@lightdotso/query-keys";
import { useAuth } from "@lightdotso/stores";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

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
      if (!params.address || clientType !== "authenticated") {
        return null;
      }

      const res = await getNotificationsCount(
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
        (data) => {
          return data;
        },
        (err) => {
          if (failureCount % 3 !== 2) {
            throw err;
          }
          return currentCountData ?? null;
        },
      );
    },
  });

  return {
    notificationsCount: notificationsCount,
    isNotificationsCountLoading: isNotificationsCountLoading,
  };
};
