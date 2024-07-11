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

import { createUserOperation } from "@lightdotso/client";
// import { TRANSACTION_ROW_COUNT } from "@lightdotso/const";
// import type { UserOperationData } from "@lightdotso/data";
import type {
  UserOperationCreateBodyParams,
  UserOperationParams,
} from "@lightdotso/params";
import { queryKeys } from "@lightdotso/query-keys";
// import { queryKeys } from "@lightdotso/query-keys";
import { useAuth, useUserOperations } from "@lightdotso/stores";
import { toast } from "@lightdotso/ui";
import {
  // useQueryClient,
  useMutation,
} from "@tanstack/react-query";
// import type { Address } from "viem";
import { toBytes, toHex } from "viem";

// -----------------------------------------------------------------------------
// Query Mutation
// -----------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useMutationUserOperationCreate = (params: UserOperationParams) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { clientType } = useAuth();
  const { resetUserOperations } = useUserOperations();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  // const queryClient = useQueryClient();

  // ---------------------------------------------------------------------------
  // Query Mutation
  // ---------------------------------------------------------------------------

  const { mutate: userOperationCreate, failureCount } = useMutation({
    mutationKey: queryKeys.user_operation.create._def,
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
              is_direct_send: true,
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
    // onMutate: async (data: UserOperationCreateBodyParams) => {
    //   const uopData = {
    //     call_data: data.userOperation.callData
    //       ? toHex(data.userOperation.callData)
    //       : "0x",
    //     call_gas_limit: data.userOperation.callGasLimit
    //       ? toHex(data.userOperation.callGasLimit)
    //       : "0x",
    //     chain_id: data.userOperation.chainId ? data.userOperation.chainId : 0,
    //     hash: data.userOperation.hash,
    //     init_code: data.userOperation.initCode,
    //     max_fee_per_gas: data.userOperation.maxFeePerGas
    //       ? toHex(data.userOperation.maxFeePerGas)
    //       : "0x",
    //     max_priority_fee_per_gas: data.userOperation.maxPriorityFeePerGas
    //       ? toHex(data.userOperation.maxPriorityFeePerGas)
    //       : "0x",
    //     nonce: data.userOperation.nonce ? Number(data.userOperation.nonce) : 0,
    //     paymaster_and_data: data.userOperation.paymasterAndData,
    //     pre_verification_gas: data.userOperation.preVerificationGas
    //       ? toHex(data.userOperation.preVerificationGas)
    //       : "0x",
    //     sender: data.userOperation.sender,
    //     signatures: [
    //       {
    //         owner_id: data.ownerId,
    //         signature: toHex(new Uint8Array([...toBytes(data.signedData), 2])),
    //         signature_type: 1,
    //         created_at: new Date().toISOString(),
    //       },
    //     ],
    //     status: "PROPOSED",
    //     verification_gas_limit: data.userOperation.verificationGasLimit
    //       ? toHex(data.userOperation.verificationGasLimit)
    //       : "0x",
    //     created_at: new Date().toISOString(),
    //     updated_at: new Date().toISOString(),
    //   };

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
    //         ...uopData,
    //       };
    //     },
    //   );
    //   return { previousData };
    // },
    onSuccess: () => {
      // Only reset the internal user operations if the transaction is successful
      // This disables the transaction fetcher from fetching the transactions again
      resetUserOperations();
    },
    onError: (err, _newWalletSettings, _context) => {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Failed to create transaction.");
      }
    },
  });

  return {
    userOperationCreate: userOperationCreate,
  };
};
