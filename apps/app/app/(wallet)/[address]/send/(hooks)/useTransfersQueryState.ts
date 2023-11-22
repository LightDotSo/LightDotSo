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
import type { Transfers } from "@/schemas";

// -----------------------------------------------------------------------------
// Parser
// -----------------------------------------------------------------------------

export const transferParser = createParser({
  parse(val) {
    if (val === "") {
      return null;
    }
    const value = decodeURIComponent(val);
    const keys = value.split(";");
    return keys.reduce<Transfers>((acc, key) => {
      const [id, address, addressOrEns, chainId, assetType, asset] =
        key.split(":");
      const transferAddress = address;

      // Parse the asset (if possible)
      if (assetType === "erc20") {
        // Get the parts of the asset
        const [address, name, decimals, quantity] = asset.split(",");
        // Parse the address as a string (if possible)
        const parsedAddress = address === "_" ? undefined : address;
        // Parse the decimals as a number (if possible)
        const parsedDecimals = parseInt(decimals);
        // Parse the quantity as a number (if possible)
        const parsedQuantity = parseInt(quantity);
        // Add the asset to the transfer if all parts are valid
        if (name && parsedDecimals && parsedQuantity) {
          acc[parseInt(id)] = {
            address: transferAddress === "_" ? undefined : transferAddress,
            addressOrEns: addressOrEns === "_" ? undefined : addressOrEns,
            chainId: parseInt(chainId),
            asset: {
              address: parsedAddress,
              name,
              decimals: parsedDecimals,
              quantity: parsedQuantity,
            },
            assetType,
          };
        }
      }

      return acc;
    }, []);
  },
  serialize(value: Transfers) {
    const entry = Object.entries(value)
      // Filter out undefined values
      .filter(([, transfer]) => transfer !== undefined)
      .map(
        ([id, transfer]) =>
          `${id}:${transfer?.address ?? "_"}:${transfer?.addressOrEns ?? "_"}:${
            transfer?.chainId ?? 0
          }:${transfer?.assetType ?? "_"}:${transfer?.asset?.address ?? "_"},${
            transfer?.asset?.name ?? "_"
          },`,
      )
      .join(";");

    // Return the serialized value encoded as a URI component
    return encodeURIComponent(entry);
  },
});

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useTransfersQueryState = () => {
  return useQueryState("transfers", transferParser.withDefault([]));
};
