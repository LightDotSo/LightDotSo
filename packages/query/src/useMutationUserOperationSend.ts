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

import {
  getSignatureUserOperation,
  sendUserOperation,
} from "@lightdotso/client";
import { CONTRACT_ADDRESSES, TRANSACTION_ROW_COUNT } from "@lightdotso/const";
import type {
  UserOperationParams,
  UserOperationSendBodyParams,
} from "@lightdotso/params";
import { queryKeys } from "@lightdotso/query-keys";
import { toast } from "@lightdotso/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Address } from "viem";
import { toHex } from "viem";

// -----------------------------------------------------------------------------
// Query Mutation
// -----------------------------------------------------------------------------

export const useMutationUserOperationSend = (params: UserOperationParams) => {
  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  // ---------------------------------------------------------------------------
  // Query Mutation
  // ---------------------------------------------------------------------------

  const {
    mutate: userOperationSend,
    isPending: isUserOperationSendPending,
    failureCount,
  } = useMutation({
    retry: 10,
    mutationFn: async (body: UserOperationSendBodyParams) => {
      const loadingToast = toast.loading("Submitting the transaction...");

      // Get the sig as bytes from caller
      const sigRes = await getSignatureUserOperation({
        params: { query: { user_operation_hash: body.hash } },
      });

      await sigRes.match(
        async sig => {
          // Sned the user operation
          const res = await sendUserOperation(body.chain_id, [
            {
              sender: body.sender,
              nonce: toHex(body.nonce),
              initCode: body.init_code,
              callData: body.call_data,
              paymasterAndData: body.paymaster_and_data,
              callGasLimit: toHex(body.call_gas_limit),
              verificationGasLimit: toHex(body.verification_gas_limit),
              preVerificationGas: toHex(body.pre_verification_gas),
              maxFeePerGas: toHex(body.max_fee_per_gas),
              maxPriorityFeePerGas: toHex(body.max_priority_fee_per_gas),
              signature: sig,
            },
            CONTRACT_ADDRESSES["Entrypoint"],
          ]);

          toast.dismiss(loadingToast);

          res.match(
            _ => {
              toast.success("You submitted the transaction!");
            },
            err => {
              if (failureCount === 10) {
                if (err instanceof Error) {
                  toast.error(err.message);
                } else {
                  toast.error("Failed to submit the transaction.");
                }
              }

              throw err;
            },
          );
        },
        async err => {
          toast.dismiss(loadingToast);
          if (err instanceof Error) {
            toast.error(err.message);
          } else {
            toast.error("Failed to get signature.");
          }
        },
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.user_operation.list({
          address: params.address as Address,
          status: "proposed",
          order: "asc",
          limit: TRANSACTION_ROW_COUNT,
          offset: 0,
          is_testnet: params.is_testnet ?? false,
        }).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.user_operation.listCount({
          address: params.address as Address,
          status: "proposed",
          is_testnet: params.is_testnet ?? false,
        }).queryKey,
      });

      // Invalidate the cache for the address
      fetch(`/api/revalidate/tag?tag=${params.address}`);
    },
  });

  return {
    isUserOperationSendPending,
    userOperationSend,
  };
};
