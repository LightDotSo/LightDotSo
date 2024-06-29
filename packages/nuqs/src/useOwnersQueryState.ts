// Copyright 2023-2024 Light
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

import { createParser, useQueryState } from "nuqs";
import { type Address, isAddress } from "viem";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type Owner = {
  address?: Address;
  addressOrEns?: string;
  weight: number;
};
export type Owners = Owner[];

// -----------------------------------------------------------------------------
// Parser
// -----------------------------------------------------------------------------

export const ownerParser = createParser({
  parse: function (value) {
    const keys = value.split(";");
    return keys.reduce<Owners>((acc, key) => {
      const [id, address, addressOrEns, weight] = key.split(":");
      // Parse the address as a string (if possible)
      const parsedAddress = address === "_" ? undefined : address;
      // Parse the addressOrEns as a string (if possible)
      const parsedAddressOrEns =
        addressOrEns === "_" ? undefined : addressOrEns;
      // Parse the weight as a number (if possible)
      const parsedWeight = parseInt(weight);
      if (
        parsedAddress &&
        isAddress(parsedAddress) &&
        parsedAddressOrEns &&
        !isNaN(parsedWeight)
      ) {
        acc[parseInt(id)] = {
          address: address === "_" ? undefined : (address as Address),
          addressOrEns: addressOrEns === "_" ? undefined : addressOrEns,
          weight: parseInt(weight),
        };
      }
      return acc;
    }, []);
  },
  serialize: function (value: Owners) {
    const entry = Object.entries(value)
      // Filter out undefined values
      .filter(([, owner]) => owner !== undefined)
      ?.map(
        ([id, owner]) =>
          `${id}:${owner?.address ?? "_"}:${owner?.addressOrEns ?? "_"}:${
            owner?.weight ?? 1
          }`,
      )
      .join(";");

    return entry;
  },
});

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useOwnersQueryState = () => {
  return useQueryState("owners", ownerParser.withDefault([]));
};
