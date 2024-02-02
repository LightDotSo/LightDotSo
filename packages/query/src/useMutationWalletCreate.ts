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

import { createUserOperation } from "@lightdotso/client";
import type { UserOperationCreateParams } from "@lightdotso/params";
import { queryKeys } from "@lightdotso/query-keys";
import type { UserOperation } from "@lightdotso/schemas";
import { useAuth } from "@lightdotso/stores";
import { toast } from "@lightdotso/ui";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import type { Address } from "viem";
import { toBytes, toHex } from "viem";

// -----------------------------------------------------------------------------
// Query Mutation
// -----------------------------------------------------------------------------

export const useMutationWalletCreate = (params: UserOperationCreateParams) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { clientType, address } = useAuth();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const { mutate, isPending, isSuccess, isError } = useMutation({
    mutationFn: async (data: Partial<UserOperation>) => {
      if (
        !data.chainId ||
        !data.hash ||
        data.nonce === undefined ||
        data.nonce === null ||
        !data.initCode ||
        !data.sender ||
        !data.callData ||
        !data.callGasLimit ||
        !data.verificationGasLimit ||
        !data.preVerificationGas ||
        !data.maxFeePerGas ||
        !data.maxPriorityFeePerGas ||
        !data.paymasterAndData
      ) {
        return;
      }

      const loadingToast = toast.loading("Creating the transaction...");

      // Replace with your actual fetch logic
      const res = await createUserOperation(
        {
          params: {
            query: {
              chain_id: Number(data.chainId),
            },
          },
          body: {
            signature: {
              owner_id: params.ownerId,
              signature: toHex(
                new Uint8Array([...toBytes(params.signedData), 2]),
              ),
              signature_type: 1,
            },
            user_operation: {
              chain_id: Number(data.chainId),
              hash: data.hash,
              nonce: Number(data.nonce),
              init_code: data.initCode,
              sender: data.sender,
              call_data: data.callData,
              call_gas_limit: Number(data.callGasLimit),
              verification_gas_limit: Number(data.verificationGasLimit),
              pre_verification_gas: Number(data.preVerificationGas),
              max_fee_per_gas: Number(data.maxFeePerGas),
              max_priority_fee_per_gas: Number(data.maxPriorityFeePerGas),
              paymaster_and_data: data.paymasterAndData,
            },
          },
        },
        clientType,
      );

      toast.dismiss(loadingToast);

      // Return if the response is 200
      res.match(
        _ => {
          toast.success("Successfully created transaction!");
        },
        err => {
          if (err instanceof Error) {
            toast.error(err.message);
          } else {
            toast.error("Failed to create transaction.");
          }

          throw err;
        },
      );
    },
    // When mutate is called:
    // onMutate: async (wallet: WalletCreateParams) => {
    // Cancel any outgoing refetches
    // (so they don't overwrite our optimistic update)
    // await queryClient.cancelQueries({
    // queryKey: queryKeys.user_operation.list({ address: address as Address }).queryKey,
    // });

    // return { wallet };
    // },
    // If the mutation fails, use the context we returned above
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onError: (err, _newWalletSettings, _context) => {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Failed to create wallet.");
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.wallet.list({
          address: address as Address,
          limit: Number.MAX_SAFE_INTEGER,
          offset: 0,
        }).queryKey,
      });

      // Invalidate the cache for the address
      // fetch(`/api/revalidate/tag?tag=${address}`);
    },
    // mutationKey: queryKeys.wallet.create({ address }).queryKey,
  });

  return {
    mutate,
    isPending,
    isSuccess,
    isError,
  };
};
