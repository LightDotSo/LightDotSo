// Copyright 2023-2024 Light.
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

  const { mutate: signatureCreate, failureCount } = useMutation({
    mutationFn: async (body: SignatureCreateBodyParams) => {
      const loadingToast = toast.loading("Creating the signature...");

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
          if (failureCount % 3 !== 2) {
            throw err;
          }

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
    signatureCreate: signatureCreate,
  };
};
