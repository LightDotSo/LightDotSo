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

import type { ConfigurationData, UserOperationData } from "@lightdotso/data";
import type { UserOperation } from "@lightdotso/schemas";
import type { Address, Hex } from "viem";

// -----------------------------------------------------------------------------
// Params
// -----------------------------------------------------------------------------

export type UserOperationParams = {
  address: Address | null | undefined;
  is_testnet?: boolean;
};

export type UserOperationGetParams = {
  hash: Hex | null | undefined;
};

export type UserOperationNonceParams = {
  address: Address | null | undefined;
  chain_id: number;
};

export type UserOperationSendParams = UserOperationGetParams & {
  address: Address | null | undefined;
  configuration: ConfigurationData | null | undefined;
  is_testnet?: boolean;
};

export type UserOperationSignatureGetParams = UserOperationGetParams & {
  configuration_id: string | null | undefined;
};

export type UserOperationListParams = {
  address: Address | null | undefined;
  status: "queued" | "history" | "executed" | "pending" | null;
  order: "desc" | "asc";
  limit: number;
  offset: number;
  is_testnet: boolean;
  chain_id?: number | null | undefined;
};

export type UserOperationListCountParams = Omit<
  UserOperationListParams,
  "order" | "limit" | "offset"
>;

// -----------------------------------------------------------------------------
// Params Body
// -----------------------------------------------------------------------------

export type UserOperationCreateBodyParams = {
  ownerId: string;
  signedData: Hex;
  userOperation: UserOperation;
};

export type UserOperationCreateBatchBodyParams = {
  merkleRoot: Hex;
  ownerId: string;
  signedData: Hex;
  userOperations: UserOperation[];
};

export type UserOperationUpdateBodyParams = Partial<UserOperation>;

export type UserOperationSendBodyParams = {
  userOperation: UserOperationData;
  userOperationSignature: Hex;
};
