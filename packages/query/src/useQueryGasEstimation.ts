// Copyright 2023-2024 Light, Inc.
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

import {
  type GasEstimationResponse,
  getRequestGasEstimation,
} from "@lightdotso/client";
import { queryKeys } from "@lightdotso/query-keys";
import { useAuth } from "@lightdotso/stores";
import { useQuery } from "@tanstack/react-query";

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

export const useQueryGasEstimation = (params: { chainId: number }) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { clientType } = useAuth();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const {
    data: gasEstimation,
    isLoading: isGasEstimationLoading,
    error: gasEstimationError,
  } = useQuery<GasEstimationResponse>({
    retry: 10,
    queryKey: queryKeys.rpc.get_gas_estimation({
      chainId: params.chainId,
    }).queryKey,
    queryFn: async () => {
      const res = await getRequestGasEstimation(
        Number(params.chainId) as number,
        clientType,
      );

      // Throw error if there is an error
      return res._unsafeUnwrap();
    },
  });

  return {
    gasEstimation: gasEstimation,
    isGasEstimationLoading: isGasEstimationLoading,
    gasEstimationError: gasEstimationError,
  };
};
