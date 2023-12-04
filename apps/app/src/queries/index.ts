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

import { mergeQueryKeys } from "@lukemorales/query-key-factory";
import type { inferQueryKeyStore } from "@lukemorales/query-key-factory";
import { auth } from "./auth";
import { configuration } from "./configuration";
import { nft } from "./nft";
import { nft_valuation } from "./nft_valation";
import { paymaster_operation } from "./paymaster_operation";
import { portfolio } from "./portfolio";
import { token } from "./token";
import { token_price } from "./token_price";
import { transaction } from "./transaction";
import { user } from "./user";
import { user_operation } from "./user_operation";
import { wallet } from "./wallet";

export const queries = mergeQueryKeys(
  auth,
  configuration,
  nft,
  nft_valuation,
  paymaster_operation,
  portfolio,
  transaction,
  user_operation,
  user,
  token,
  token_price,
  wallet,
);

export type QueryKeys = inferQueryKeyStore<typeof queries>;
