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

import { z } from "zod";

// -----------------------------------------------------------------------------
// Schema
// -----------------------------------------------------------------------------

const erc20 = z.object({
  address: z.string().optional(),
  decimals: z.number().optional(),
  quantity: z.number().optional(),
});

const erc721 = z.object({
  address: z.string().optional(),
  tokenId: z.number().optional(),
  quantity: z.number().optional(),
});

const erc1155 = z.object({
  address: z.string().optional(),
  tokenId: z.number().optional(),
  quantity: z.number().optional(),
});

const erc1155Batch = z.object({
  address: z.string().optional(),
  tokenIds: z.array(z.number()),
  quantities: z.array(z.number()),
});

export const asset = z.union([erc20, erc721, erc1155, erc1155Batch]);

export const transfer = z.object({
  address: z.string().optional(),
  addressOrEns: z.string().optional(),
  asset: asset.optional(),
  assetType: z.string().optional(),
  chainId: z.number().optional(),
});

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type Asset = z.infer<typeof asset>;
export type Transfer = z.infer<typeof transfer>;
