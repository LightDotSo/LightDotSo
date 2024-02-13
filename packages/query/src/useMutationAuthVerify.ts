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
    verify,
    isVerifySuccess,
  };
};
