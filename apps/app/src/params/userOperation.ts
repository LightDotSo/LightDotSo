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

import type { Address, Hex } from "viem";

// -----------------------------------------------------------------------------
// Params
// -----------------------------------------------------------------------------

export type UserOperationGetParams = {
  hash: Hex;
};

export type UserOperationNonceParams = {
  address: Address;
  chain_id: number;
};

export type UserOperationListParams = {
  address: Address;
  status: "proposed" | "history";
  order: "desc" | "asc";
  limit: number;
  offset: number;
  is_testnet: boolean;
};

export type UserOperationListCountParams = Omit<
  UserOperationListParams,
  "order" | "limit" | "offset"
>;
