// Copyright 2023-2024 Light.
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

import type { Row } from "@tanstack/react-table";

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

export const groupByDate = <T extends { created_at: string }>(
  array: { original: T; row: Row<T> }[],
): Record<string, { original: T; row: Row<T> }[]> => {
  return array.reduce(
    (acc: Record<string, { original: T; row: Row<T> }[]>, item) => {
      const date = new Date(item.original.created_at);
      const key = date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

      (acc[key] = acc[key] || []).push(item);
      return acc;
    },
    {},
  );
};
