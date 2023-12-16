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

import { getTransactionsCount as getClientTransactionsCount } from "@lightdotso/client";
import type { TransactionListCountParams } from "@/params";
import "server-only";

// -----------------------------------------------------------------------------
// Pre
// -----------------------------------------------------------------------------

export const preload = (params: TransactionListCountParams) => {
  void getTransactionsCount(params);
};

// -----------------------------------------------------------------------------
// Service
// -----------------------------------------------------------------------------

export const getTransactionsCount = async (
  params: TransactionListCountParams,
) => {
  return getClientTransactionsCount(
    {
      params: {
        query: {
          address: params.address,
          is_testnet: params.is_testnet,
        },
      },
    },
    false,
  );
};
