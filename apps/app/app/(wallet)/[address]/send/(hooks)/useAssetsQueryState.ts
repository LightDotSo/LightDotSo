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

export type Asset = {
  address?: string;
  addressOrEns?: string;
  weight: number;
};
export type Assets = Asset[];

// -----------------------------------------------------------------------------
// Parser
// -----------------------------------------------------------------------------

export const assetParser = createParser({
  parse(val) {
    if (val === "") {
      return null;
    }
    const value = decodeURIComponent(val);
    const keys = value.split(";");
    return keys.reduce<Assets>((acc, key) => {
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
  serialize(value: Assets) {
    const entry = Object.entries(value)
      // Filter out undefined values
      .filter(([, asset]) => asset !== undefined)
      .map(
        ([id, asset]) =>
          `${id}:${asset?.address ?? "_"}:${asset?.addressOrEns ?? "_"}:${
            asset?.weight ?? 1
          }`,
      )
      .join(";");

    // Return the serialized value encoded as a URI component
    return encodeURIComponent(entry);
  },
});

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useAssetsQueryState = () => {
  return useQueryState("assets", assetParser.withDefault([]));
};
