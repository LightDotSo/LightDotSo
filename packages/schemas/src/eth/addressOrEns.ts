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

import { Address } from "abitype/zod";
import { z } from "zod";

// -----------------------------------------------------------------------------
// Schema
// -----------------------------------------------------------------------------

export const addressOrEns = Address.or(
  z.string().refine(
    (value) => {
      // Check if it's a possible ENS name
      // biome-ignore lint/performance/useTopLevelRegex: <explanation>
      const dnsRegex = /^(?:(?:(?:\w[\w-]*\.)+[a-zA-Z]{2,}))/;
      if (dnsRegex.test(value)) {
        return true;
      }

      // If neither, return false
      return false;
    },
    {
      message: "Input should be a valid ENS Domain",
      path: ["addressOrEns"],
    },
  ),
);

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type AddressOrEns = z.infer<typeof addressOrEns>;
