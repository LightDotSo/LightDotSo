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
import { isAddress } from "viem";
import type { Transfers } from "@/schemas";

// -----------------------------------------------------------------------------
// Parser
// -----------------------------------------------------------------------------

export const transferParser = createParser({
  parse(value) {
    if (value === "") {
      return null;
    }
    const keys = value.split(";");
    return keys.reduce<Transfers>((acc, key) => {
      const [id, address, addressOrEns, chainId, assetType, asset] =
        key.split(":");
      const transferAddress = address;

      // Parse the asset (if possible)
      if (assetType === "erc20") {
        // Get the parts of the asset
        const [address, decimals, quantity] = asset.split("|");
        // Parse the address as a string (if possible)
        const parsedAddress = address === "_" ? undefined : address;
        // Parse the decimals as a number (if possible)
        const parsedDecimals = parseInt(decimals);
        // Parse the quantity as a number (if possible)
        const parsedQuantity = parseInt(quantity);
        // Add the asset to the transfer if all parts are valid
        if (
          parsedAddress &&
          isAddress(parsedAddress) &&
          !isNaN(parsedDecimals) &&
          !isNaN(parsedQuantity)
        ) {
          acc[parseInt(id)] = {
            address: transferAddress === "_" ? undefined : transferAddress,
            addressOrEns: addressOrEns === "_" ? undefined : addressOrEns,
            chainId: parseInt(chainId),
            asset: {
              address: parsedAddress,
              decimals: parsedDecimals,
              quantity: parsedQuantity,
            },
            assetType,
          };
        }
      }

      // Parse the asset (if possible)
      if (assetType === "erc721") {
        // Get the parts of the asset
        const [address, tokenId, quantity] = asset.split("|");
        // Parse the address as a string (if possible)
        const parsedAddress = address === "_" ? undefined : address;
        // Parse the tokenId as a number (if possible)
        const parsedTokenId = parseInt(tokenId);
        // Parse the quantity as a number (if possible)
        const parsedQuantity = parseInt(quantity);
        // Add the asset to the transfer if all parts are valid
        if (
          parsedAddress &&
          isAddress(parsedAddress) &&
          !isNaN(parsedTokenId) &&
          !isNaN(parsedQuantity)
        ) {
          acc[parseInt(id)] = {
            address: transferAddress === "_" ? undefined : transferAddress,
            addressOrEns: addressOrEns === "_" ? undefined : addressOrEns,
            chainId: parseInt(chainId),
            asset: {
              address: parsedAddress,
              tokenId: parsedTokenId,
              quantity: parsedQuantity,
            },
            assetType,
          };
        }
      }

      // Parse the asset (if possible)
      if (assetType === "erc1155") {
        // Get the parts of the asset
        const [address, tokenIds, quantities] = asset.split("|");
        // Parse the address as a string (if possible)
        const parsedAddress = address === "_" ? undefined : address;
        // Parse the tokenIds as an array of numbers (if possible)
        const parsedTokenIds = tokenIds.split(";").map(id => parseInt(id));
        // Parse the quantities as an array of numbers (if possible)
        const parsedQuantities = quantities
          .split("&")
          .map(quantity => parseInt(quantity));
        // Add the asset to the transfer if all parts are valid
        if (
          parsedAddress &&
          isAddress(parsedAddress) &&
          parsedTokenIds.every(id => !isNaN(id)) &&
          parsedQuantities.every(quantity => !isNaN(quantity))
        ) {
          acc[parseInt(id)] = {
            address: transferAddress === "_" ? undefined : transferAddress,
            addressOrEns: addressOrEns === "_" ? undefined : addressOrEns,
            chainId: parseInt(chainId),
            asset: {
              address: parsedAddress,
              tokenIds: parsedTokenIds,
              quantities: parsedQuantities,
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
      .filter(([, transfer]) => transfer !== undefined)
      .map(([id, transfer]) => {
        let assetString = "";

        if (transfer?.assetType === "erc20") {
          const asset = transfer.asset;
          assetString = `${asset?.address ?? "_"}|${
            transfer?.asset && "decimals" in transfer.asset
              ? transfer.asset.decimals
              : 0
          }|${
            transfer?.asset && "quantity" in transfer.asset
              ? transfer.asset.quantity
              : 0
          }`;
        } else if (transfer?.assetType === "erc721") {
          const asset = transfer.asset;
          assetString = `${asset?.address ?? "_"}|${
            transfer?.asset && "tokenId" in transfer.asset
              ? transfer.asset.tokenId
              : 0
          }|${
            transfer?.asset && "quantity" in transfer.asset
              ? transfer.asset.quantity
              : 0
          }`;
        } else if (transfer?.assetType === "erc1155") {
          const asset = transfer.asset;
          const tokenIds =
            (transfer?.asset &&
              "tokenIds" in transfer.asset &&
              transfer.asset?.tokenIds?.join("&")) ??
            "_";
          const quantities =
            (transfer?.asset &&
              "tokenIds" in transfer.asset &&
              transfer.asset?.tokenIds?.join("&")) ??
            "_";
          assetString = `${asset?.address ?? "_"}|${tokenIds}|${quantities}`;
        }

        return (
          `${id}:${transfer?.address ?? "_"}:` +
          `${transfer?.addressOrEns ?? "_"}:` +
          `${transfer?.chainId ?? 0}:${
            transfer?.assetType ?? "_"
          }:${assetString}`
        );
      })
      .join(";");

    // Return the serialized value encoded as a URI component
    return entry;
  },
});

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useTransfersQueryState = () => {
  return useQueryState("transfers", transferParser.withDefault([]));
};
