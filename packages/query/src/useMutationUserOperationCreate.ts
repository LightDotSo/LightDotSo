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
import type { UserOperationCreateBodyParams } from "@lightdotso/params";
import { queryKeys } from "@lightdotso/query-keys";
import { useAuth } from "@lightdotso/stores";
import { toast } from "@lightdotso/ui";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import type { Address } from "viem";
import { toBytes, toHex } from "viem";

// -----------------------------------------------------------------------------
// Query Mutation
// -----------------------------------------------------------------------------

export const useMutationUserOperationCreate = () => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { clientType, address } = useAuth();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  // ---------------------------------------------------------------------------
  // Query Mutation
  // ---------------------------------------------------------------------------

  const { mutate, isPending, isSuccess, isError } = useMutation({
    mutationFn: async (body: UserOperationCreateBodyParams) => {
      if (
        !body.userOperation.chainId ||
        !body.userOperation.hash ||
        body.userOperation.nonce === undefined ||
        body.userOperation.nonce === null ||
        !body.userOperation.initCode ||
        !body.userOperation.sender ||
        !body.userOperation.callData ||
        !body.userOperation.callGasLimit ||
        !body.userOperation.verificationGasLimit ||
        !body.userOperation.preVerificationGas ||
        !body.userOperation.maxFeePerGas ||
        !body.userOperation.maxPriorityFeePerGas ||
        !body.userOperation.paymasterAndData
      ) {
        return;
      }

      const loadingToast = toast.loading("Creating the transaction...");

      // Replace with your actual fetch logic
      const res = await createUserOperation(
        {
          params: {
            query: {
              chain_id: Number(body.userOperation.chainId),
            },
          },
          body: {
            signature: {
              owner_id: body.ownerId,
              signature: toHex(
                new Uint8Array([...toBytes(body.signedData), 2]),
              ),
              signature_type: 1,
            },
            user_operation: {
              chain_id: Number(body.userOperation.chainId),
              hash: body.userOperation.hash,
              nonce: Number(body.userOperation.nonce),
              init_code: body.userOperation.initCode,
              sender: body.userOperation.sender,
              call_data: body.userOperation.callData,
              call_gas_limit: Number(body.userOperation.callGasLimit),
              verification_gas_limit: Number(
                body.userOperation.verificationGasLimit,
              ),
              pre_verification_gas: Number(
                body.userOperation.preVerificationGas,
              ),
              max_fee_per_gas: Number(body.userOperation.maxFeePerGas),
              max_priority_fee_per_gas: Number(
                body.userOperation.maxPriorityFeePerGas,
              ),
              paymaster_and_data: body.userOperation.paymasterAndData,
            },
          },
        },
        clientType,
      );

      toast.dismiss(loadingToast);

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
    onError: (err, _newWalletSettings, _context) => {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Failed to create transaction.");
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
