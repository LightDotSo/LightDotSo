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

import type { WalletData } from "@lightdotso/data";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Params
// -----------------------------------------------------------------------------

export type WalletParams = {
  address: Address | null | undefined;
};

export type WalletListParams = {
  address: Address | null | undefined;
  limit: number;
  offset: number;
  user_id?: string;
};

export type WalletListCountParams = Omit<WalletListParams, "limit" | "offset">;

// -----------------------------------------------------------------------------
// Params Body
// -----------------------------------------------------------------------------

export type WalletCreateBodyParams = {
  address: Address | null | undefined;
  simulate: boolean;
  name: string;
  threshold: number;
  owners: {
    address: Address;
    weight: number;
  }[];
  invite_code: string;
  salt: string;
};

export type WalletUpdateBodyParams = Partial<WalletData>;
