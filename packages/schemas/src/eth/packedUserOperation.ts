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

export const packedUserOperation = z.object({
  chainId: z.bigint(),
  hash: z.string(),
  sender: z.string(),
  nonce: z.bigint(),
  factory: z.string().nullable(),
  factoryData: z.string().nullable(),
  callData: z.string(),
  callGasLimit: z.bigint(),
  verificationGasLimit: z.bigint(),
  preVerificationGas: z.bigint(),
  maxFeePerGas: z.bigint(),
  maxPriorityFeePerGas: z.bigint(),
  paymaster: z.string().nullable(),
  paymasterVerificationGasLimit: z.bigint().nullable(),
  paymasterPostOpGasLimit: z.bigint().nullable(),
  paymasterData: z.string().nullable(),
  signature: z.string(),
});

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type PackedUserOperation = z.infer<typeof packedUserOperation>;
