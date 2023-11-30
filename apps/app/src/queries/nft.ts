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

import { createQueryKeys } from "@lukemorales/query-key-factory";
import type { inferQueryKeys } from "@lukemorales/query-key-factory";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Type
// -----------------------------------------------------------------------------

type NftFilter = {
  address: Address;
  is_testnet?: boolean;
};

// -----------------------------------------------------------------------------
// Keys
// -----------------------------------------------------------------------------

export const nft = createQueryKeys("nft", {
  list: (filter: NftFilter) => ({
    queryKey: [{ filter }],
  }),
});

// -----------------------------------------------------------------------------
// Infer
// -----------------------------------------------------------------------------

export type NftKeys = inferQueryKeys<typeof nft>;
