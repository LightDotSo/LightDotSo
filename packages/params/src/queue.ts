// Copyright 2023-2024 Light
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

import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Params
// -----------------------------------------------------------------------------

export type QueueMinimalParams = {
  isMinimal?: boolean;
};

export type QueueParams = {
  address: Address | null | undefined;
} & QueueMinimalParams;

// -----------------------------------------------------------------------------
// Params Body
// -----------------------------------------------------------------------------

export type QueueInterpretationBodyParams = {
  transaction_hash?: string | null | undefined;
  user_operation_hash?: string | null | undefined;
};

export type QueueTransactionBodyParams = {
  chain_id: number;
  hash: string;
};

export type QueueUserOpeartionBodyParams = {
  hash: string;
};
