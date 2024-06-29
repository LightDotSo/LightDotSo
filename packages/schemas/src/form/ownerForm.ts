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

import { z } from "zod";
import { address, addressOrEns } from "../web3";

// -----------------------------------------------------------------------------
// Schema
// -----------------------------------------------------------------------------

export const ownerFormSchema = z.object({
  threshold: z
    .number()
    .int()
    .min(1, { message: "Threshold must be at least 1." }),
  owners: z.array(
    z.object({
      address: address.optional(),
      addressOrEns: addressOrEns.optional(),
      weight: z
        .number()
        .int()
        .min(1, { message: "Weight must be at least 1." }),
    }),
  ),
});

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type OwnerForm = z.infer<typeof ownerFormSchema>;
