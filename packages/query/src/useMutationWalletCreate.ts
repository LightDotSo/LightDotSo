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

import { createWallet } from "@lightdotso/client";
import type { WalletData } from "@lightdotso/data";
import type { WalletCreateBodyParams, WalletParams } from "@lightdotso/params";
import { queryKeys } from "@lightdotso/query-keys";
import { useAuth } from "@lightdotso/stores";
import { toast } from "@lightdotso/ui";
import { useQueryClient, useMutation } from "@tanstack/react-query";

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

  const { mutate, isPending, isSuccess, isError, failureCount } = useMutation({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        _ => {
          toast.success("Successfully updated name!");
        },
        err => {
          if (failureCount % 3 !== 2) {
            throw err;
          }

          if (err instanceof Error) {
            toast.error(err.message);
          } else {
            toast.error("Failed to update name.");
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
          return { ...old, data };
        },
      );

      // Return a context object with the snapshotted value
      return { previousSettings };
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
    mutationKey: queryKeys.wallet.get({ address: params.address }).queryKey,
  });

  return {
    mutate,
    isPending,
    isSuccess,
    isError,
  };
};
