// Copyright 2023-2024 Light, Inc.
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

import { PAGINATION_SIZES } from "@lightdotso/const";
import type { PaginationState } from "@tanstack/react-table";
import { createParser, useQueryState } from "nuqs";

// -----------------------------------------------------------------------------
// Parser
// -----------------------------------------------------------------------------

export const paginationParser = createParser({
  parse: function (value: string): PaginationState | null {
    if (!value) {
      return null;
    }
    const [pageIndex, pageSize] = value
      .split(",")
      .map(val => Number.parseInt(val));
    if (isNaN(pageIndex) || isNaN(pageSize)) {
      return null;
    }

    const finalPageSize = PAGINATION_SIZES.includes(pageSize) ? pageSize : 10;
    return { pageIndex: pageIndex, pageSize: finalPageSize };
  },
  serialize: function (value: PaginationState): string {
    return `${value.pageIndex},${value.pageSize}`;
  },
})
  .withDefault({ pageIndex: 0, pageSize: 10 })
  .withOptions({ shallow: false });

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const usePaginationQueryState = () => {
  return useQueryState("pagination", paginationParser);
};
