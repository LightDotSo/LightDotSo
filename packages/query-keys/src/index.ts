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

import { mergeQueryKeys } from "@lukemorales/query-key-factory";
import type { inferQueryKeyStore } from "@lukemorales/query-key-factory";
import { activity } from "./activity";
import { auth } from "./auth";
import { configuration } from "./configuration";
import { configuration_operation } from "./configuration_operation";
import { ens } from "./ens";
import { feedback } from "./feedback";
import { nft } from "./nft";
import { nft_valuation } from "./nft_valation";
import { notification } from "./notification";
import { paymaster_operation } from "./paymaster_operation";
import { portfolio } from "./portfolio";
import { queue } from "./queue";
import { rpc } from "./rpc";
import { signature } from "./signature";
import { simulation } from "./simulation";
import { socket } from "./socket";
import { token } from "./token";
import { token_price } from "./token_price";
import { transaction } from "./transaction";
import { user } from "./user";
import { user_operation } from "./user_operation";
import { user_operation_merkle } from "./user_operation_merkle";
import { wallet } from "./wallet";
import { wallet_settings } from "./wallet_settings";

export const queryKeys = mergeQueryKeys(
  auth,
  activity,
  configuration,
  configuration_operation,
  ens,
  feedback,
  nft,
  nft_valuation,
  notification,
  paymaster_operation,
  portfolio,
  queue,
  rpc,
  signature,
  simulation,
  socket,
  transaction,
  user_operation,
  user_operation_merkle,
  user,
  token,
  token_price,
  wallet,
  wallet_settings,
);

export type QueryKeys = inferQueryKeyStore<typeof queryKeys>;
