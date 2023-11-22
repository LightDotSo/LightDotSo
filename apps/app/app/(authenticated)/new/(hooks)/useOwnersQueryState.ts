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

import { createParser, useQueryState } from "next-usequerystate";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type Owner = {
  address?: string;
  addressOrEns?: string;
  weight: number;
};
export type Owners = Owner[];

// -----------------------------------------------------------------------------
// Parser
// -----------------------------------------------------------------------------

export const ownerParser = createParser({
  parse(value) {
    const keys = value.split(";");
    return keys.reduce<Owners>((acc, key) => {
      const [id, address, addressOrEns, weight] = key.split(":");
      // Parse the id as a number (if possible)
      acc[parseInt(id)] = {
        address: address === "_" ? undefined : address,
        addressOrEns: addressOrEns === "_" ? undefined : addressOrEns,
        weight: parseInt(weight),
      };
      return acc;
    }, []);
  },
  serialize(value: Owners) {
    const entry = Object.entries(value)
      // Filter out undefined values
      .filter(([, owner]) => owner !== undefined)
      .map(
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
