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

export const transferParser = createParser({
  parse: function (value) {
    if (value === "") {
      return null;
    }
    const [address, addressOrEns, chainId, assetType, asset] = value.split(":");
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

      if (
        parsedAddress &&
        isAddress(parsedAddress) &&
        !isNaN(parsedDecimals) &&
        !isNaN(parsedQuantity)
      ) {
        return {
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

      if (
        parsedAddress &&
        isAddress(parsedAddress) &&
        !isNaN(parsedTokenId) &&
        !isNaN(parsedQuantity)
      ) {
        return {
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

    return null;
  },

  serialize: function (value: Transfer) {
    if (!value) {
      return "";
    }

    let assetString = "";

    if (value.assetType === "erc20") {
      const asset = value.asset;
      assetString = `${asset?.address ?? "_"}|${
        asset && "decimals" in asset ? asset.decimals : 0
      }|${asset && "quantity" in asset ? asset.quantity : 0}`;
    } else if (value.assetType === "erc721" || value.assetType === "erc1155") {
      const asset = value.asset;
      assetString = `${asset?.address ?? "_"}|${
        asset && "tokenId" in asset ? asset.tokenId : 0
      }|${asset && "quantity" in asset ? asset.quantity : 0}`;
    }

    return (
      `${value?.address ?? "_"}:` +
      `${value?.addressOrEns ?? "_"}:` +
      `${value?.chainId ?? 0}:${value?.assetType}:${assetString}`
    );
  },
});

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useTransferQueryState = (initialTransfer?: Transfer) => {
  return useQueryState(
    "transfer",
    transferParser.withDefault(initialTransfer ?? {}).withOptions({
      throttleMs: 3000,
    }),
  );
};
