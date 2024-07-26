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

import { updateWalletSettings } from "@lightdotso/client";
import type { WalletSettingsData } from "@lightdotso/data";
import type {
  WaleltSettingsUpdateBodyParams,
  WalletSettingsParams,
} from "@lightdotso/params";
import { queryKeys } from "@lightdotso/query-keys";
import { toast } from "@lightdotso/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// -----------------------------------------------------------------------------
// Query Mutation
// -----------------------------------------------------------------------------

export const useMutationWalletSettingsUpdate = (
  params: WalletSettingsParams,
) => {
  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  // ---------------------------------------------------------------------------
  // Query Mutation
  // ---------------------------------------------------------------------------

  const {
    mutate,
    isSuccess: isWalletSettingsUpdateSuccess,
    isError: isWalletSettingsUpdateError,
    isPending: isWalletSettingsUpdatePending,
    failureCount,
  } = useMutation({
    mutationKey: queryKeys.wallet_settings.update._def,
    mutationFn: async (body: WaleltSettingsUpdateBodyParams) => {
      if (!params.address) {
        return;
      }

      const loadingToast = toast.loading("Updating wallet settings...");

      const res = await updateWalletSettings({
        params: {
          query: {
            address: params.address,
          },
        },
        body: {
          wallet_settings: {
            is_enabled_dev: body.is_enabled_dev,
            is_enabled_testnet: body.is_enabled_testnet,
          },
        },
      });

      toast.dismiss(loadingToast);

      res.match(
        (_) => {
          toast.success("Successfully updated wallet settings!");
        },
        (err) => {
          if (failureCount % 3 !== 2) {
            throw err;
          }

          if (err instanceof Error) {
            toast.error(err.message);
          } else {
            toast.error("Something went wrong.");
          }
        },
      );
    },
    // When mutate is called:
    onMutate: async (data: WaleltSettingsUpdateBodyParams) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: queryKeys.wallet.settings({ address: params.address })
          .queryKey,
      });

      // Snapshot the previous value
      const previousSettings: WalletSettingsData | undefined =
        queryClient.getQueryData(
          queryKeys.wallet.settings({ address: params.address }).queryKey,
        );

      // Optimistically update to the new value
      queryClient.setQueryData(
        queryKeys.wallet.settings({ address: params.address }).queryKey,
        (old: WalletSettingsData) => {
          return { ...old, data: data };
        },
      );

      // Return a context object with the snapshotted value
      return { previousSettings: previousSettings };
    },
    // If the mutation fails, use the context we returned above
    onError: (err, _newWalletSettings, context) => {
      queryClient.setQueryData(
        queryKeys.wallet.settings({ address: params.address }).queryKey,
        context?.previousSettings,
      );

      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Something went wrong.");
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.wallet.settings({ address: params.address })
          .queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.auth.session({ address: params.address }).queryKey,
      });

      // Invalidate the cache for the address
      fetch(`/api/revalidate/tag?tag=${params.address}`);
    },
  });

  return {
    mutate: mutate,
    isWalletSettingsUpdateSuccess: isWalletSettingsUpdateSuccess,
    isWalletSettingsUpdateError: isWalletSettingsUpdateError,
    isWalletSettingsUpdatePending: isWalletSettingsUpdatePending,
  };
};
