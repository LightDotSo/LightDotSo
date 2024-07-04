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

import { createConfigurationOperation } from "@lightdotso/client";
import type {
  ConfigurationOperationCreateBodyParams,
  ConfigurationOperationParams,
} from "@lightdotso/params";
import { queryKeys } from "@lightdotso/query-keys";
import { useAuth } from "@lightdotso/stores";
import { toast } from "@lightdotso/ui";
import { useMutation } from "@tanstack/react-query";
import type { Address } from "viem";
import { toBytes, toHex } from "viem";

// -----------------------------------------------------------------------------
// Query Mutation
// -----------------------------------------------------------------------------

export const useMutationConfigurationOperationCreate = (
  params: ConfigurationOperationParams,
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

  const { mutate: configurationOperationCreate, failureCount } = useMutation({
    mutationKey: queryKeys.configuration_operation.create._def,
    mutationFn: async (body: ConfigurationOperationCreateBodyParams) => {
      const loadingToast = toast.loading("Upgrading the wallet...");

      // Replace with your actual fetch logic
      const res = await createConfigurationOperation(
        {
          params: {
            query: {
              address: params.address as Address,
              simulate: params.simulate ?? true,
            },
          },
          body: {
            signature: {
              owner_id: body.ownerId,
              signature: toHex(
                new Uint8Array([...toBytes(body.signedData), 2]),
              ),
            },
            threshold: body.threshold,
            owners: body.owners,
          },
        },
        clientType,
      );

      toast.dismiss(loadingToast);

      res.match(
        _ => {
          toast.success("Successfully submitted upgrade proposal!");
        },
        err => {
          if (failureCount === 10) {
            if (err instanceof Error) {
              toast.error(err.message);
            } else {
              toast.error("Failed to submit the wallet upgrade proposal.");
            }
          }

          throw err;
        },
      );
    },
    // onMutate: async (data: ConfigurationCreateBodyParams) => {
    //   const uopData = {
    //     call_data: data.configuration.callData,
    //     call_gas_limit: data.configuration.callGasLimit,
    //     chain_id: data.configuration.chainId,
    //     hash: data.configuration.hash,
    //     init_code: data.configuration.initCode,
    //     max_fee_per_gas: data.configuration.maxFeePerGas,
    //     max_priority_fee_per_gas: data.configuration.maxPriorityFeePerGas,
    //     nonce: data.configuration.nonce,
    //     paymaster_and_data: data.configuration.paymasterAndData,
    //     pre_verification_gas: data.configuration.preVerificationGas,
    //     sender: data.configuration.sender,
    //     signatures: [
    //       {
    //         owner_id: data.ownerId,
    //         signature: toHex(new Uint8Array([...toBytes(data.signedData), 2])),
    //         signature_type: 1,
    //         created_at: new Date().toISOString(),
    //       },
    //     ],
    //     status: "PROPOSED",
    //     verification_gas_limit: data.configuration.verificationGasLimit,
    //     created_at: new Date().toISOString(),
    //     updated_at: new Date().toISOString(),
    //   };

    //   const previousData: ConfigurationData[] | undefined =
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
    //     (old: ConfigurationData[]) => {
    //       return {
    //         ...old,
    //         ...uopData,
    //       };
    //     },
    //   );
    //   return { previousData };
    // },
    onError: (err, _newWalletSettings, _context) => {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Failed to create the upgrade proposal.");
      }
    },
  });

  return {
    configurationOperationCreate: configurationOperationCreate,
  };
};
