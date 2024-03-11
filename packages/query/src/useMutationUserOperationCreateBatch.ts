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

import { createBatchUserOperation } from "@lightdotso/client";
import type {
  UserOperationCreateBatchBodyParams,
  UserOperationParams,
} from "@lightdotso/params";
import { useAuth } from "@lightdotso/stores";
import { toast } from "@lightdotso/ui";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toBytes, toHex } from "viem";

// -----------------------------------------------------------------------------
// Query Mutation
// -----------------------------------------------------------------------------

export const useMutationUserOperationCreateBatch = (
  params: UserOperationParams,
) => {
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

  const {
    mutate: userOperationCreateBatch,
    isPending,
    isSuccess,
    isError,
    failureCount,
  } = useMutation({
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

      const loadingToast = toast.loading("Creating the transaction...");

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
              signature_type: 1,
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
    onError: (err, _newWalletSettings, _context) => {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Failed to create transaction.");
      }
    },
  });

  return {
    userOperationCreateBatch,
    isPending,
    isSuccess,
    isError,
  };
};
