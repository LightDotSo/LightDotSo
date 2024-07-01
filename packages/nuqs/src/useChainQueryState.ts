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

import { CHAINS } from "@lightdotso/const";
import { createParser, useQueryState } from "nuqs";
import { Chain } from "viem";

// -----------------------------------------------------------------------------
// Parser
// -----------------------------------------------------------------------------

export const chainParser = createParser({
  parse: function (value: string) {
    // Find the chain by lowercase name of value w/ matching `chain.name` in `CHAINS`
    const chain = CHAINS.find(
      chain => chain.name.toLowerCase() === value.toLowerCase(),
    );
    return chain ?? null;
  },
  serialize: function (value: Chain) {
    // Return the lowercase name of `chain.name`
    return value.name.toLowerCase();
  },
});

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useChainQueryState = () => {
  return useQueryState("chain", chainParser);
};
