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

import type { inferQueryKeyStore } from "@lukemorales/query-key-factory";
import { mergeQueryKeys } from "@lukemorales/query-key-factory";

import { configuration } from "./configuration";
import { portfolio } from "./portfolio";
import { transaction } from "./transaction";
import { user_operation } from "./user_operation";
import { user } from "./user";
import { token } from "./token";
import { token_price } from "./token_price";
import { wallet } from "./wallet";

export const queries = mergeQueryKeys(
  configuration,
  portfolio,
  transaction,
  user_operation,
  user,
  token,
  token_price,
  wallet,
);

export type QueryKeys = inferQueryKeyStore<typeof queries>;
