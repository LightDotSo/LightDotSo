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
import { CONTRACT_ADDRESSES } from "@lightdotso/const";
import type { UserOperationSendBodyParams } from "@lightdotso/params";
import { toast } from "@lightdotso/ui";
import { useMutation } from "@tanstack/react-query";
import { backOff } from "exponential-backoff";
import { ResultAsync } from "neverthrow";
import { toHex } from "viem";

// -----------------------------------------------------------------------------
// Query Mutation
// -----------------------------------------------------------------------------

export const useMutationUserOperationSend = () => {
  // ---------------------------------------------------------------------------
  // Query Mutation
  // ---------------------------------------------------------------------------

  const { mutate: userOperationSend } = useMutation({
    mutationFn: async (body: UserOperationSendBodyParams) => {
      const loadingToast = toast.loading("Submitting the transaction...");

      // Get the sig as bytes from caller
      const sigRes = await getSignatureUserOperation({
        params: { query: { user_operation_hash: body.hash } },
      });

      await sigRes.match(
        sig => {
          // Sned the user operation
          const res = ResultAsync.fromPromise(
            backOff(() =>
              sendUserOperation(body.chain_id, [
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
              ]).then(res => res._unsafeUnwrap()),
            ),
            () => new Error("Database error"),
          );

          toast.dismiss(loadingToast);

          res.match(
            _ => {
              toast.success("You submitted the transaction!");
            },
            err => {
              if (err instanceof Error) {
                toast.error(err.message);
              } else {
                toast.error("Failed to submit the transaction.");
              }
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
  });

  return {
    userOperationSend,
  };
};
