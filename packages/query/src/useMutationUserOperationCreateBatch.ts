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

import { createBatchUserOperation } from "@lightdotso/client";
// import { TRANSACTION_ROW_COUNT } from "@lightdotso/const";
// import type { UserOperationData } from "@lightdotso/data";
import type {
  UserOperationCreateBatchBodyParams,
  UserOperationParams,
} from "@lightdotso/params";
import { queryKeys } from "@lightdotso/query-keys";
// import { queryKeys } from "@lightdotso/query-keys";
import { useAuth } from "@lightdotso/stores";
import { toast } from "@lightdotso/ui";
import {
  // useQueryClient,
  useMutation,
} from "@tanstack/react-query";
import {
  // type Address,
  toBytes,
  toHex,
} from "viem";

// -----------------------------------------------------------------------------
// Query Mutation
// -----------------------------------------------------------------------------

export const useMutationUserOperationCreateBatch = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  params: UserOperationParams,
) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { clientType } = useAuth();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  // const queryClient = useQueryClient();

  // ---------------------------------------------------------------------------
  // Query Mutation
  // ---------------------------------------------------------------------------

  const { mutate: userOperationCreateBatch, failureCount } = useMutation({
    mutationKey: queryKeys.user_operation.create_batch._def,
    mutationFn: async (body: UserOperationCreateBatchBodyParams) => {
      let hasInvalidData = body.userOperations.some(userOperation => {
        return (
          !userOperation.chainId ||
          !userOperation.hash ||
          userOperation.nonce === undefined ||
          userOperation.nonce === null ||
          !userOperation.initCode ||
          !userOperation.sender ||
          !userOperation.callData ||
          !userOperation.callGasLimit ||
          !userOperation.verificationGasLimit ||
          !userOperation.preVerificationGas ||
          !userOperation.maxFeePerGas ||
          !userOperation.maxPriorityFeePerGas ||
          !userOperation.paymasterAndData
        );
      });

      if (hasInvalidData) {
        return;
      }

      const loadingToast = toast.loading("Creating the transactions...");

      // Replace with your actual fetch logic
      const res = await createBatchUserOperation(
        {
          params: {},
          body: {
            merkle_root: body.merkleRoot,
            signature: {
              owner_id: body.ownerId,
              signature: toHex(
                new Uint8Array([...toBytes(body.signedData), 2]),
              ),
              signature_type: 2,
            },
            user_operations: body.userOperations.map(userOperation => {
              return {
                chain_id: Number(userOperation.chainId),
                hash: userOperation.hash!,
                nonce: Number(userOperation.nonce),
                init_code: userOperation.initCode!,
                sender: userOperation.sender!,
                call_data: userOperation.callData!,
                call_gas_limit: Number(userOperation.callGasLimit),
                verification_gas_limit: Number(
                  userOperation.verificationGasLimit,
                ),
                pre_verification_gas: Number(userOperation.preVerificationGas),
                max_fee_per_gas: Number(userOperation.maxFeePerGas),
                max_priority_fee_per_gas: Number(
                  userOperation.maxPriorityFeePerGas,
                ),
                paymaster_and_data: userOperation.paymasterAndData!,
              };
            }),
          },
        },
        clientType,
      );

      toast.dismiss(loadingToast);

      res.match(
        _ => {
          toast.success("Successfully created transactions!");
        },
        err => {
          if (failureCount === 10) {
            if (err instanceof Error) {
              toast.error(err.message);
            } else {
              toast.error("Failed to submit the transactions.");
            }
          }

          throw err;
        },
      );
    },
    // onMutate: async (data: UserOperationCreateBatchBodyParams) => {
    //   const uopsData = data.userOperations.map(userOperation => ({
    //     call_data: userOperation.callData
    //       ? toHex(userOperation.callData)
    //       : "0x",
    //     call_gas_limit: userOperation.callGasLimit
    //       ? toHex(userOperation.callGasLimit)
    //       : "0x",
    //     chain_id: userOperation.chainId ? userOperation.chainId : 0,
    //     hash: userOperation.hash,
    //     init_code: userOperation.initCode,
    //     max_fee_per_gas: userOperation.maxFeePerGas
    //       ? toHex(userOperation.maxFeePerGas)
    //       : "0x",
    //     max_priority_fee_per_gas: userOperation.maxPriorityFeePerGas
    //       ? toHex(userOperation.maxPriorityFeePerGas)
    //       : "0x",
    //     nonce: userOperation.nonce ? Number(userOperation.nonce) : 0,
    //     paymaster_and_data: userOperation.paymasterAndData,
    //     pre_verification_gas: userOperation.preVerificationGas
    //       ? toHex(userOperation.preVerificationGas)
    //       : "0x",
    //     sender: userOperation.sender,
    //     signatures: [
    //       {
    //         owner_id: data.ownerId,
    //         signature: toHex(new Uint8Array([...toBytes(data.signedData), 2])),
    //         signature_type: 1,
    //         created_at: new Date().toISOString(),
    //       },
    //     ],
    //     status: "PROPOSED",
    //     verification_gas_limit: userOperation.verificationGasLimit
    //       ? toHex(userOperation.verificationGasLimit)
    //       : "0x",
    //     created_at: new Date().toISOString(),
    //     updated_at: new Date().toISOString(),
    //   }));

    //   const previousData: UserOperationData[] | undefined =
    //     queryClient.getQueryData(
    //       queryKeys.user_operation.list({
    //         address: params.address as Address,
    //         status: "queued",
    //         order: "asc",
    //         limit: TRANSACTION_ROW_COUNT,
    //         offset: 0,
    //         is_testnet: params.is_testnet ?? false,
    //       }).queryKey,
    //     );
    //   queryClient.setQueryData(
    //     queryKeys.user_operation.list({
    //       address: params.address as Address,
    //       status: "queued",
    //       order: "asc",
    //       limit: TRANSACTION_ROW_COUNT,
    //       offset: 0,
    //       is_testnet: params.is_testnet ?? false,
    //     }).queryKey,
    //     (old: UserOperationData[]) => {
    //       return {
    //         ...old,
    //         ...uopsData,
    //       };
    //     },
    //   );
    //   return { previousData };
    // },
    onError: (err, _newWalletSettings, _context) => {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Failed to create transactions.");
      }
    },
  });

  return {
    userOperationCreateBatch: userOperationCreateBatch,
  };
};
