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
import { TRANSACTION_ROW_COUNT } from "@lightdotso/const";
import { UserOperationData } from "@lightdotso/data";
import type {
  UserOperationCreateBodyParams,
  UserOperationParams,
} from "@lightdotso/params";
import { queryKeys } from "@lightdotso/query-keys";
import { useAuth } from "@lightdotso/stores";
import { toast } from "@lightdotso/ui";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import type { Address } from "viem";
import { toBytes, toHex } from "viem";

// -----------------------------------------------------------------------------
// Query Mutation
// -----------------------------------------------------------------------------

export const useMutationUserOperationCreate = (params: UserOperationParams) => {
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

  const {
    mutate: userOperationCreate,
    isPending,
    isSuccess,
    isError,
    failureCount,
  } = useMutation({
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
    onMutate: async (data: UserOperationCreateBodyParams) => {
      const previousData: UserOperationData[] | undefined =
        queryClient.getQueryData(
          queryKeys.user_operation.list({
            address: params.address as Address,
            status: "proposed",
            order: "asc",
            limit: TRANSACTION_ROW_COUNT,
            offset: 0,
            is_testnet: params.is_testnet ?? false,
          }).queryKey,
        );
      queryClient.setQueryData(
        queryKeys.user_operation.list({
          address: params.address as Address,
          status: "proposed",
          order: "asc",
          limit: TRANSACTION_ROW_COUNT,
          offset: 0,
          is_testnet: params.is_testnet ?? false,
        }).queryKey,
        (old: UserOperationData[]) => {
          return {
            ...old,
            ...{
              call_data: data.userOperation.callData,
              call_gas_limit: data.userOperation.callGasLimit,
              chain_id: data.userOperation.chainId,
              hash: data.userOperation.hash,
              init_code: data.userOperation.initCode,
              max_fee_per_gas: data.userOperation.maxFeePerGas,
              max_priority_fee_per_gas: data.userOperation.maxPriorityFeePerGas,
              nonce: data.userOperation.nonce,
              paymaster_and_data: data.userOperation.paymasterAndData,
              pre_verification_gas: data.userOperation.preVerificationGas,
              sender: data.userOperation.sender,
              signatures: [
                {
                  owner_id: data.ownerId,
                  signature: toHex(
                    new Uint8Array([...toBytes(data.signedData), 2]),
                  ),
                  signature_type: 1,
                  created_at: new Date().toISOString(),
                },
              ],
              status: "PROPOSED",
              verification_gas_limit: data.userOperation.verificationGasLimit,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          };
        },
      );
      return { previousData };
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
    userOperationCreate,
    isPending,
    isSuccess,
    isError,
  };
};
