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

import { sendUserOperation } from "@lightdotso/client";
import { CONTRACT_ADDRESSES, TRANSACTION_ROW_COUNT } from "@lightdotso/const";
import type { UserOperationData } from "@lightdotso/data";
import type {
  UserOperationSendParams,
  UserOperationSendBodyParams,
} from "@lightdotso/params";
import { queryKeys } from "@lightdotso/query-keys";
import { toast } from "@lightdotso/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Address } from "viem";
import { toHex } from "viem";
import { useQueryUserOperationReceipt } from "./useQueryUserOperationReceipt";
import { useQueryUserOperation } from "./useQueryUserOperation";

// -----------------------------------------------------------------------------
// Query Mutation
// -----------------------------------------------------------------------------

export const useMutationUserOperationSend = (
  params: UserOperationSendParams,
) => {
  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { userOperation } = useQueryUserOperation({
    hash: params.hash,
  });
  const { userOperationReceipt, refetchUserOperationReceipt } =
    useQueryUserOperationReceipt({
      chainId: userOperation?.chain_id ?? null,
      hash: params.hash,
    });
  const queryClient = useQueryClient();

  // ---------------------------------------------------------------------------
  // Query Mutation
  // ---------------------------------------------------------------------------

  const {
    mutate: userOperationSend,
    isPending: isUserOperationSendPending,
    failureCount,
  } = useMutation({
    retryDelay: 1000,
    mutationKey: queryKeys.user_operation.send._def,
    mutationFn: async (body: UserOperationSendBodyParams) => {
      // If the user operation receipt is already fetched, return
      if (userOperationReceipt) {
        return;
      }

      const loadingToast = toast.loading("Submitting the transaction...");

      const { userOperation, userOperationSignature } = body;

      // Sned the user operation
      const res = await sendUserOperation(userOperation.chain_id, [
        {
          sender: userOperation.sender,
          nonce: toHex(userOperation.nonce),
          initCode: userOperation.init_code,
          callData: userOperation.call_data,
          paymasterAndData: userOperation.paymaster_and_data,
          callGasLimit: toHex(userOperation.call_gas_limit),
          verificationGasLimit: toHex(userOperation.verification_gas_limit),
          preVerificationGas: toHex(userOperation.pre_verification_gas),
          maxFeePerGas: toHex(userOperation.max_fee_per_gas),
          maxPriorityFeePerGas: toHex(userOperation.max_priority_fee_per_gas),
          signature: userOperationSignature,
        },
        // Hardcoded to use the latest version of the wallet factory
        CONTRACT_ADDRESSES["v0.6.0 Entrypoint"],
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
    onError: async () => {
      // Refetch the user operation receipt if there is an error
      await refetchUserOperationReceipt();
    },
    onMutate: async (data: UserOperationSendBodyParams) => {
      const previousData: UserOperationData[] | undefined =
        queryClient.getQueryData(
          queryKeys.user_operation.list({
            address: params.address as Address,
            status: "queued",
            order: "asc",
            limit: TRANSACTION_ROW_COUNT,
            offset: 0,
            is_testnet: params.is_testnet ?? false,
          }).queryKey,
        );
      queryClient.setQueryData(
        queryKeys.user_operation.list({
          address: params.address as Address,
          status: "queued",
          order: "asc",
          limit: TRANSACTION_ROW_COUNT,
          offset: 0,
          is_testnet: params.is_testnet ?? false,
        }).queryKey,
        (old: UserOperationData[]) => {
          // Get the data same as the data in the list, and update the status to "pending"
          const newData =
            old && old.length > 0
              ? old.map(d => {
                  if (d.hash === data.userOperation.hash) {
                    return { ...d, status: "PENDING" };
                  }
                  return d;
                })
              : [];
          return newData;
        },
      );

      // Add 3 second delay for buffer
      await new Promise(resolve => setTimeout(resolve, 3000));

      return { previousData: previousData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.user_operation.listCount({
          address: params.address as Address,
          status: "queued",
          is_testnet: params.is_testnet ?? false,
        }).queryKey,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.user_operation.list({
          address: params.address as Address,
          status: "pending",
          order: "desc",
          limit: Number.MAX_SAFE_INTEGER,
          offset: 0,
          is_testnet: true,
        }).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.user_operation.list({
          address: params.address as Address,
          status: "queued",
          order: "asc",
          limit: TRANSACTION_ROW_COUNT,
          offset: 0,
          is_testnet: params.is_testnet ?? false,
        }).queryKey,
      });
    },
  });

  return {
    userOperationSend: userOperationSend,
    isUserOperationSendPending: isUserOperationSendPending,
  };
};
