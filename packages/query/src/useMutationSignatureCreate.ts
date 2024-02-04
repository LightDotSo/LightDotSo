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

import { createSignature } from "@lightdotso/client";
import type {
  SignatureCreateBodyParams,
  SignatureParams,
} from "@lightdotso/params";
import { useAuth } from "@lightdotso/stores";
import { toast } from "@lightdotso/ui";
import { useMutation } from "@tanstack/react-query";
import { toBytes, toHex } from "viem";

// -----------------------------------------------------------------------------
// Query Mutation
// -----------------------------------------------------------------------------

export const useMutationSignatureCreate = (params: SignatureParams) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { clientType } = useAuth();

  // ---------------------------------------------------------------------------
  // Query Mutation
  // ---------------------------------------------------------------------------

  const { mutate: signatureCreate } = useMutation({
    mutationFn: async (body: SignatureCreateBodyParams) => {
      const loadingToast = toast.loading("Submitting the transaction...");

      const res = await createSignature(
        {
          params: {
            query: {
              user_operation_hash: params.user_operation_hash,
            },
          },
          body: {
            signature: {
              owner_id: body.owner_id,
              signature: toHex(new Uint8Array([...toBytes(body.signature), 2])),
              signature_type: 1,
            },
          },
        },
        clientType,
      );

      toast.dismiss(loadingToast);

      res.match(
        _ => {
          toast.success("Successfully submitted transaction!");
        },
        err => {
          if (err instanceof Error) {
            toast.error(err.message);
          } else {
            toast.error("An unknown error occurred.");
          }

          throw err;
        },
      );
    },
  });

  return {
    signatureCreate,
  };
};
