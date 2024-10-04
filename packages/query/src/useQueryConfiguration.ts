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

import { getConfiguration } from "@lightdotso/client";
import type { ConfigurationData } from "@lightdotso/data";
import type { ConfigurationParams } from "@lightdotso/params";
import { queryKeys } from "@lightdotso/query-keys";
import { useAuth } from "@lightdotso/stores";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

export const useQueryConfiguration = (params: ConfigurationParams) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { clientType } = useAuth();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const currentData: ConfigurationData | undefined = queryClient.getQueryData(
    queryKeys.configuration.get({
      address: params.address,
      image_hash: params.image_hash,
      checkpoint: params.checkpoint,
    }).queryKey,
  );

  const {
    data: configuration,
    isLoading: isConfigurationLoading,
    refetch: refetchConfiguration,
    failureCount,
  } = useQuery<ConfigurationData | null>({
    queryKey: queryKeys.configuration.get({
      address: params.address,
      image_hash: params.image_hash,
      checkpoint: params.checkpoint,
    }).queryKey,
    queryFn: async () => {
      if (!params.address) {
        return null;
      }

      const res = await getConfiguration(
        {
          params: {
            query: {
              address: params.address,
              image_hash: params.image_hash,
              checkpoint: params.checkpoint,
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
          return currentData ?? null;
        },
      );
    },
  });

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    configuration: configuration,
    isConfigurationLoading: isConfigurationLoading,
    refetchConfiguration: refetchConfiguration,
  };
};
