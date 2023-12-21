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

import { getUserOperations as getClientUserOperations } from "@lightdotso/client";
import "server-only";
import type { UserOperationListParams } from "@/params";

// -----------------------------------------------------------------------------
// Pre
// -----------------------------------------------------------------------------

export const preload = (params: UserOperationListParams) => {
  void getUserOperations(params);
};

// -----------------------------------------------------------------------------
// Service
// -----------------------------------------------------------------------------

export const getUserOperations = async (params: UserOperationListParams) => {
  return getClientUserOperations(
    {
      params: {
        query: {
          address: params.address,
          status: params.status,
          direction: params.direction,
          limit: params.limit,
          offset: params.offset,
          is_testnet: params.is_testnet,
        },
      },
    },
    false,
  );
};
