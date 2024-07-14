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

import { z } from "zod";

// -----------------------------------------------------------------------------
// Schema
// -----------------------------------------------------------------------------

export const swap = z.object({
  /// The address of the token.
  address: z.string().optional(),
  /// The chain ID of the token.
  chainId: z.number().optional(),
  /// The amount of the token to swap.
  amount: z.bigint().optional(),
  /// The quantity of the token to swap in number format. (user input)
  quantity: z.number().optional(),
});

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type Swap = z.infer<typeof swap>;
