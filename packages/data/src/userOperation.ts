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

import type { InterpretationData } from "./interpretation";

// -----------------------------------------------------------------------------
// Data
// -----------------------------------------------------------------------------

export type UserOperationData = {
  call_data: string;
  call_gas_limit: number;
  chain_id: number;
  hash: string;
  init_code: string;
  max_fee_per_gas: number;
  max_priority_fee_per_gas: number;
  nonce: number;
  paymaster_and_data: string;
  pre_verification_gas: number;
  sender: string;
  signatures: {
    owner_id: string;
    signature: string;
    signature_type: number;
    created_at: string;
  }[];
  status: string;
  transaction?:
    | {
        hash: string;
      }
    | null
    | undefined;
  verification_gas_limit: number;
  created_at: string;
  updated_at: string;
  interpretation?: InterpretationData | null | undefined;
};

export type UserOperationCountData = {
  count: number;
};

export type UserOperationNonceData = {
  nonce: number;
};

export type UserOperationSignatureData = string;
