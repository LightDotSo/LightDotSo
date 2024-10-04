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

import { getSocketTokenPrice } from "@lightdotso/client";
import type { SocketTokenPriceData } from "@lightdotso/data";
import type { SocketTokenPriceParams } from "@lightdotso/params";
import { queryKeys } from "@lightdotso/query-keys";
import { useAuth } from "@lightdotso/stores";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

export const useQuerySocketTokenPrice = (params: SocketTokenPriceParams) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { clientType } = useAuth();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const currentData: SocketTokenPriceData | undefined =
    queryClient.getQueryData(
      queryKeys.socket.token_price({
        address: params.address,
        chainId: params.chainId,
      }).queryKey,
    );

  const {
    data: socketTokenPrice,
    isLoading: isSocketTokenPriceLoading,
    failureCount,
  } = useQuery<SocketTokenPriceData | null>({
    queryKey: queryKeys.socket.token_price({
      address: params.address,
      chainId: params.chainId,
    }).queryKey,
    queryFn: async () => {
      if (!(params.address && params.chainId)) {
        return null;
      }

      const res = await getSocketTokenPrice(
        {
          params: {
            query: {
              tokenAddress: params.address,
              chainId: params.chainId.toString(),
            },
          },
        },
        clientType,
      );

      return res.match(
        (data) => {
          return data.result as SocketTokenPriceData;
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
    socketTokenPrice: socketTokenPrice,
    isSocketTokenPriceLoading: isSocketTokenPriceLoading,
  };
};
