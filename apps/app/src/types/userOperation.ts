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

import * as z from "zod";

// -----------------------------------------------------------------------------
// Schema
// -----------------------------------------------------------------------------

export const userOperation = z.object({
  chainId: z.bigint().optional(),
  hash: z.string().optional(),
  nonce: z.bigint().optional(),
  initCode: z.string().optional(),
  sender: z.string().optional(),
  callData: z.string().optional(),
  callGasLimit: z.bigint().optional(),
  verificationGasLimit: z.bigint().optional(),
  preVerificationGas: z.bigint().optional(),
  maxFeePerGas: z.bigint().optional(),
  maxPriorityFeePerGas: z.bigint().optional(),
  paymaster_and_data: z.string().optional(),
});

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type UserOperation = z.infer<typeof userOperation>;
