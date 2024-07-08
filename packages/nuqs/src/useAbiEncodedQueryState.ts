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

import type { AbiEncoded } from "@lightdotso/schemas";
import { createParser, useQueryState } from "nuqs";
import { isHex } from "viem";

// ----------------------------------------------------------------------------
// Parser
// ----------------------------------------------------------------------------

export const abiEncodedParser = createParser({
  parse: function (value) {
    if (value === "") {
      return null;
    }
    const [abiAddress, encodedFunctionSelector, encodedCallData] =
      value.split(":");

    if (
      isHex(abiAddress) &&
      isHex(encodedFunctionSelector) &&
      isHex(encodedCallData)
    ) {
      return {
        address: abiAddress === "0x" ? undefined : abiAddress,
        functionName:
          encodedFunctionSelector === "0x"
            ? undefined
            : encodedFunctionSelector,
        callData: encodedCallData === "0x" ? undefined : encodedCallData,
      };
    }

    return null;
  },

  serialize: function (value: AbiEncoded) {
    if (!value) {
      return "";
    }

    return (
      `${value.address ?? "_"}:` +
      `${value.functionName ?? "_"}:` +
      `${value.callData ?? "_"}`
    );
  },
});

// ----------------------------------------------------------------------------
// Hook
// ----------------------------------------------------------------------------

export const useAbiEncodedQueryState = (initialAbi?: AbiEncoded) => {
  return useQueryState(
    "abiEncoded",
    abiEncodedParser.withDefault(initialAbi ?? {}).withOptions({
      throttleMs: 3000,
    }),
  );
};
