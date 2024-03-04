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
  getUserOperationSignature,
  sendUserOperation,
} from "@lightdotso/client";
import { CONTRACT_ADDRESSES, TRANSACTION_ROW_COUNT } from "@lightdotso/const";
import type { UserOperationData } from "@lightdotso/data";
import type {
  UserOperationSendParams,
  UserOperationSendBodyParams,
} from "@lightdotso/params";
import { queryKeys } from "@lightdotso/query-keys";
import { toast } from "@lightdotso/ui";
import { useReadLightWalletImageHash } from "@lightdotso/wagmi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Address } from "viem";
import { toHex } from "viem";
import { useQueryConfiguration } from "./useQueryConfiguration";
import { useQueryWallet } from "./useQueryWallet";

// -----------------------------------------------------------------------------
// Query Mutation
// -----------------------------------------------------------------------------

export const useMutationUserOperationSend = (
  params: UserOperationSendParams,
) => {
  // ---------------------------------------------------------------------------
  // Wagmi
  // ---------------------------------------------------------------------------

  const { data: imageHash } = useReadLightWalletImageHash({
    address: params.address as Address,
    chainId: params.chain_id ?? undefined,
  });

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const { configuration, isConfigurationLoading } = useQueryConfiguration({
    address: params.address as Address,
    image_hash: imageHash,
  });

  const { wallet } = useQueryWallet({
    address: params.address as Address,
  });

  // ---------------------------------------------------------------------------
  // Query Mutation
  // ---------------------------------------------------------------------------

  const {
    mutate: userOperationSend,
    isPending: isUserOperationSendPending,
    isIdle: isUserOperationSendIdle,
    isSuccess: isUserOperationSendSuccess,
    failureCount,
  } = useMutation({
    retry: 10,
    mutationFn: async (body: UserOperationSendBodyParams) => {
      if (isConfigurationLoading) {
        return;
      }

      const loadingToast = toast.loading("Submitting the transaction...");

      // Get the sig as bytes from caller
      const sigRes = await getUserOperationSignature({
        params: {
          query: {
            user_operation_hash: body.hash,
            configuration_id: configuration?.id,
          },
        },
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
            wallet?.factory_address === CONTRACT_ADDRESSES["v0.1.0 Factory"]
              ? CONTRACT_ADDRESSES["Entrypoint"]
              : CONTRACT_ADDRESSES["Entrypoint"],
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
                  if (d.hash === data.hash) {
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

      return { previousData };
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
      queryClient.invalidateQueries({
        queryKey: queryKeys.user_operation.listCount({
          address: params.address as Address,
          status: "queued",
          is_testnet: params.is_testnet ?? false,
        }).queryKey,
      });
    },
  });

  return {
    isUserOperationSendPending,
    isUserOperationSendIdle,
    isUserOperationSendSuccess,
    userOperationSend,
  };
};
