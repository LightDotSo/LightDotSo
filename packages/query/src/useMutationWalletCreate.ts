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

import { createWallet } from "@lightdotso/client";
import type { WalletData } from "@lightdotso/data";
import type { WalletCreateBodyParams, WalletParams } from "@lightdotso/params";
import { queryKeys } from "@lightdotso/query-keys";
import { useAuth } from "@lightdotso/stores";
import { toast } from "@lightdotso/ui/components/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// -----------------------------------------------------------------------------
// Query Mutation
// -----------------------------------------------------------------------------

export const useMutationWalletCreate = (params: WalletParams) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { clientType } = useAuth();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  // ---------------------------------------------------------------------------
  // Query Mutation
  // ---------------------------------------------------------------------------

  const {
    mutate,
    isError: isWalletCreateError,
    failureCount,
  } = useMutation({
    mutationKey: queryKeys.wallet.create._def,

    mutationFn: async (body: WalletCreateBodyParams) => {
      const loadingToast = toast.loading("Creating wallet...");

      // Replace with your actual fetch logic
      const res = await createWallet(
        {
          params: {
            query: {
              simulate: body.simulate,
            },
          },
          body: {
            invite_code: body.invite_code,
            name: body.name,
            salt: body.salt,
            threshold: body.threshold,
            owners: body.owners,
          },
        },
        clientType,
      );

      toast.dismiss(loadingToast);

      // Return if the response is 200
      res.match(
        (_) => {
          toast.success("Successfully created wallet!");
        },
        (err) => {
          if (failureCount % 3 !== 2) {
            throw err;
          }

          if (err instanceof Error) {
            toast.error(err.message);
          } else {
            toast.error("Failed to create wallet.");
          }

          throw err;
        },
      );
    },
    onMutate: async (data: WalletCreateBodyParams) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: queryKeys.wallet.get({ address: params.address }).queryKey,
      });

      // Snapshot the previous value
      const previousSettings: WalletData | undefined = queryClient.getQueryData(
        queryKeys.wallet.get({ address: params.address }).queryKey,
      );

      // Optimistically update to the new value
      queryClient.setQueryData(
        queryKeys.wallet.settings({ address: params.address }).queryKey,
        (old: WalletData) => {
          return { ...old, data: data };
        },
      );

      // Return a context object with the snapshotted value
      return { previousSettings: previousSettings };
    },
    // If the mutation fails, use the context we returned above
    onError: (err, _newWalletSettings, context) => {
      queryClient.setQueryData(
        queryKeys.wallet.get({ address: params.address }).queryKey,
        context?.previousSettings,
      );

      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Failed to create wallet.");
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.wallet.get({ address: params.address }).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.wallet.list({
          address: params.address,
          limit: Number.MAX_SAFE_INTEGER,
          offset: 0,
        }).queryKey,
      });

      // Invalidate the cache for the address
      // fetch(`/api/revalidate/tag?tag=${address}`);
    },
  });

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    mutate: mutate,
    isWalletCreateError: isWalletCreateError,
  };
};
