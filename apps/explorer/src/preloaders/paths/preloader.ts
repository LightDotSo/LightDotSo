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

import { isTestnetParser, paginationParser } from "@lightdotso/nuqs";
import {
  preloadGetUserOperations,
  preloadGetUserOperationsCount,
} from "@lightdotso/services";

// -----------------------------------------------------------------------------
// Preloader
// -----------------------------------------------------------------------------

export const preloader = async (searchParams: {
  isTestnet?: string;
  pagination?: string;
}) => {
  // ---------------------------------------------------------------------------
  // Parsers
  // ---------------------------------------------------------------------------

  const isTestnet = isTestnetParser.parseServerSide(searchParams.isTestnet);

  const paginationState = paginationParser.parseServerSide(
    searchParams.pagination,
  );

  // ---------------------------------------------------------------------------
  // Preloaders
  // ---------------------------------------------------------------------------

  preloadGetUserOperations({
    address: null,
    offset: paginationState.pageIndex * paginationState.pageSize,
    limit: paginationState.pageSize,
    order: "asc",
    status: "history",
    is_testnet: isTestnet ?? false,
  });
  preloadGetUserOperationsCount({
    address: null,
    status: "history",
    is_testnet: isTestnet ?? false,
  });
};
