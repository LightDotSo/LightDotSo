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

import type { Transfer } from "@lightdotso/schemas";
import { createParser, useQueryState } from "nuqs";
import { isAddress } from "viem";

// -----------------------------------------------------------------------------
// Parser
// -----------------------------------------------------------------------------

export const transfersParser = createParser({
  parse: function (value) {
    if (value === "") {
      return null;
    }
    const keys = value.split(";");
    return keys.reduce<Array<Transfer>>((acc, key) => {
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
        const parsedQuantity = parseFloat(quantity);
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
            assetType: assetType,
          };
        }
      }

      // Parse the asset (if possible)
      if (assetType === "erc721" || assetType === "erc1155") {
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
            assetType: assetType,
          };
        }
      }

      return acc;
    }, []);
  },
  serialize: function (value: Array<Transfer>) {
    const entry = Object.entries(value)
      .filter(([, transfer]) => transfer !== undefined)
      ?.map(([id, transfer]) => {
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
        } else if (
          transfer?.assetType === "erc721" ||
          transfer?.assetType === "erc1155"
        ) {
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

export const useTransfersQueryState = (initialTransfers?: Array<Transfer>) => {
  return useQueryState(
    "transfers",
    transfersParser.withDefault(initialTransfers ?? []).withOptions({
      throttleMs: 3000,
    }),
  );
};
