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

import { authVerify } from "@lightdotso/client";
import type { AuthParams, AuthVerifyBodyParams } from "@lightdotso/params";
import { useAuth } from "@lightdotso/stores";
import { toast } from "@lightdotso/ui";
import { useMutation } from "@tanstack/react-query";
import type { Address } from "viem";
import { useQueryAuthSession } from "./useQueryAuthSession";

// -----------------------------------------------------------------------------
// Query Mutation
// -----------------------------------------------------------------------------

export const useMutationAuthVerify = (params: AuthParams) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { clientType } = useAuth();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { refetchAuthSession } = useQueryAuthSession({
    address: params.address as Address,
  });

  // ---------------------------------------------------------------------------
  // Query Mutation
  // ---------------------------------------------------------------------------

  const {
    mutate: verify,
    isSuccess: isVerifySuccess,
    failureCount,
  } = useMutation({
    mutationKey: ["authVerify"],
    mutationFn: async (body: AuthVerifyBodyParams) => {
      if (!params.address) {
        return;
      }

      const loadingToast = toast.loading("Verifying wallet...");

      const res = await authVerify(
        {
          params: { query: { user_address: params.address } },
          body: { message: body.message, signature: body.signature },
        },
        clientType,
      );

      toast.dismiss(loadingToast);

      res.match(
        _ => {
          toast.success("Successfully signed in!");
        },
        err => {
          if (failureCount % 3 !== 2) {
            throw err;
          }

          if (err instanceof Error) {
            toast.error(err.message);
          } else {
            toast.error("Failed to sign in.");
          }

          throw err;
        },
      );
    },
    onSuccess: () => {
      refetchAuthSession();
    },
  });

  return {
    verify: verify,
    isVerifySuccess: isVerifySuccess,
  };
};
