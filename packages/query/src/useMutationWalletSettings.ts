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

import { updateWalletSettings } from "@lightdotso/client";
import type { WalletSettingsData } from "@lightdotso/data";
import type { WalletParams } from "@lightdotso/params";
import { queryKeys } from "@lightdotso/query-keys";
import { toast } from "@lightdotso/ui";
import { useQueryClient, useMutation } from "@tanstack/react-query";

// -----------------------------------------------------------------------------
// Query Mutation
// -----------------------------------------------------------------------------

export const useMutationWalletSettings = (params: WalletParams) => {
  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const { mutate, isPending, isSuccess, isError } = useMutation({
    mutationFn: async (data: WalletSettingsData) => {
      const loadingToast = toast.loading("Updating wallet settings...");

      const res = await updateWalletSettings({
        params: {
          query: {
            address: params.address,
          },
        },
        body: {
          wallet_settings: {
            is_enabled_testnet: data.is_enabled_testnet,
          },
        },
      });

      toast.dismiss(loadingToast);

      // Return if the response is 200
      res.match(
        _ => {
          toast.success("Successfully updated wallet settings.");
        },
        err => {
          if (err instanceof Error) {
            toast.error(err.message);
          } else {
            toast.error("Something went wrong.");
          }
        },
      );
    },
    // When mutate is called:
    onMutate: async (walletSettings: WalletSettingsData) => {
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
          return { ...old, walletSettings };
        },
      );

      // Return a context object with the snapshotted value
      return { previousSettings };
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
    mutationKey: queryKeys.wallet.settings({ address: params.address })
      .queryKey,
  });

  return {
    mutate,
    isPending,
    isSuccess,
    isError,
  };
};
