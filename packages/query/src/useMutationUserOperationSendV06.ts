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

import { sendUserOperationV06 } from "@lightdotso/client";
import {
  CONTRACT_ADDRESSES,
  ContractAddress,
  TRANSACTION_ROW_COUNT,
} from "@lightdotso/const";
import type { UserOperationData } from "@lightdotso/data";
import type {
  UserOperationSendBodyParams,
  UserOperationSendParams,
} from "@lightdotso/params";
import { queryKeys } from "@lightdotso/query-keys";
import { toast } from "@lightdotso/ui/components/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Address } from "viem";
import { toHex } from "viem";
import { useQueryUserOperation } from "./useQueryUserOperation";
import { useQueryUserOperationReceipt } from "./useQueryUserOperationReceipt";

// -----------------------------------------------------------------------------
// Query Mutation
// -----------------------------------------------------------------------------

export const useMutationUserOperationSendV06 = (
  params: UserOperationSendParams,
) => {
  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { userOperation } = useQueryUserOperation({
    hash: params.hash,
  });
  const { userOperationReceipt } = useQueryUserOperationReceipt({
    chainId: userOperation?.chain_id ?? null,
    hash: params.hash ?? null,
  });
  const queryClient = useQueryClient();

  // ---------------------------------------------------------------------------
  // Query Mutation
  // ---------------------------------------------------------------------------

  const {
    mutate: userOperationSendV06,
    isPending: isUserOperationSendV06Pending,
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

      // Get the user operation and user operation signature
      const { userOperation, userOperationSignature } = body;

      // Send the user operation
      const res = await sendUserOperationV06(userOperation.chain_id, [
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
        CONTRACT_ADDRESSES[ContractAddress.ENTRYPOINT_V060_ADDRESS],
      ]);

      toast.dismiss(loadingToast);

      res.match(
        (_) => {
          toast.success("You submitted the transaction!");
        },
        (err) => {
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
    onMutate: (data: UserOperationSendBodyParams) => {
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
              ? old.map((d) => {
                  if (d.hash === data.userOperation.hash) {
                    return { ...d, status: "PENDING" };
                  }
                  return d;
                })
              : [];
          // Encode bigint to hex
          const encodedData = newData.map((d) => {
            return {
              ...d,
              call_gas_limit: toHex(d.call_gas_limit),
              verification_gas_limit: toHex(d.verification_gas_limit),
              pre_verification_gas: toHex(d.pre_verification_gas),
              max_fee_per_gas: toHex(d.max_fee_per_gas),
              max_priority_fee_per_gas: toHex(d.max_priority_fee_per_gas),
            };
          });
          return encodedData;
        },
      );

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
    userOperationSendV06: userOperationSendV06,
    isUserOperationSendV06Pending: isUserOperationSendV06Pending,
  };
};
