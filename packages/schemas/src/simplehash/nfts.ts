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

export const paymentTokenSchema = z.object({
  payment_token_id: z.string().nullable(),
  name: z.string().nullable(),
  symbol: z.string().nullable(),
  address: z.string().optional().nullable(),
  decimals: z.number().optional().nullable(),
});

export const saleSchema = z.object({
  from_address: z.string().optional().nullable(),
  to_address: z.string().optional().nullable(),
  quantity: z.number().optional().nullable(),
  timestamp: z.string().nullable(),
  transaction: z.string().nullable(),
  marketplace_name: z.string().nullable(),
  is_bundle_sale: z.boolean().nullable(),
  payment_token: paymentTokenSchema,
  unit_price: z.number().optional().nullable(),
  total_price: z.number().optional().nullable(),
});

export const collectionInfoSchema = z.object({
  id: z.string().nullable(),
  name: z.string().nullable(),
  description: z.string().nullable(),
  chain: z.string().nullable(),
});

export const ownerSchema = z.object({
  nft_id: z.string().optional().nullable(),
  owner_address: z.string().nullable(),
  quantity: z.number().optional().nullable(),
  first_acquired_date: z.string().nullable(),
  last_acquired_date: z.string().nullable(),
});

export const floorPriceSchema = z.object({
  marketplace_id: z.string().nullable(),
  value: z.number().optional().nullable(),
  payment_token: paymentTokenSchema,
});

export const tokenQuantitySchema = z.object({
  address: z.string().nullable(),
  quantity: z.number().optional().nullable(),
  first_acquired_date: z.string().nullable(),
  last_acquired_date: z.string().nullable(),
});

export const saleDetailsSchema = z.object({
  marketplace_name: z.string().nullable(),
  is_bundle_sale: z.boolean().nullable(),
  payment_token: paymentTokenSchema,
  unit_price: z.number().optional().nullable(),
  total_price: z.number().optional().nullable(),
});

export const transferSchema = z.object({
  nft_id: z.string().nullable(),
  chain: z.string().nullable(),
  contract_address: z.string().nullable(),
  token_id: z.string().nullable(),
  from_address: z.string().optional().nullable(),
  to_address: z.string().nullable(),
  quantity: z.number().optional().nullable(),
  timestamp: z.string().nullable(),
  block_number: z.number().optional().nullable(),
  block_hash: z.string().optional().nullable(),
  transaction: z.string().nullable(),
  log_index: z.number().optional().nullable(),
  batch_transfer_index: z.number().optional().nullable(),
  sale_details: saleDetailsSchema.optional().nullable(),
});

export const collectionSchema = z.object({
  collection_id: z.string().nullable(),
  name: z.string().nullable(),
  description: z.string().nullable(),
  image_url: z.string().optional().nullable(),
  banner_image_url: z.string().optional().nullable(),
  external_url: z.string().optional().nullable(),
  twitter_username: z.string().optional().nullable(),
  discord_url: z.string().optional().nullable(),
  marketplace_pages: z.array(
    z.object({
      marketplace_name: z.string().nullable(),
      marketplace_collection_id: z.string().nullable(),
      collection_url: z.string().nullable(),
      verified: z.boolean().nullable(),
    }),
  ),
  metaplex_mint: z.string().optional().nullable(),
  metaplex_first_verified_creator: z.string().optional().nullable(),
  spam_score: z.number().optional().nullable(),
  floor_prices: z.array(floorPriceSchema),
});

export const nftSchema = z.object({
  nft_id: z.string().nullable(),
  chain: z.string().nullable(),
  contract_address: z.string().nullable(),
  token_id: z.string().nullable(),
  name: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  video_url: z.string().optional().nullable(),
  audio_url: z.string().optional().nullable(),
  model_url: z.string().optional().nullable(),
  previews: z.object({
    image_small_url: z.string().optional().nullable(),
    image_medium_url: z.string().optional().nullable(),
    image_large_url: z.string().optional().nullable(),
    image_opengraph_url: z.string().optional().nullable(),
    blurhash: z.string().optional().nullable(),
  }),
  background_color: z.string().optional().nullable(),
  external_url: z.string().optional().nullable(),
  created_date: z
    .union([z.date().optional(), z.string().optional()])
    .nullable(),
  status: z.union([z.literal("minted"), z.literal("burned")]),
  token_count: z.number().optional().nullable(),
  owner_count: z.number().optional().nullable(),
  owners: z.array(ownerSchema),
  last_sale: saleSchema.optional().nullable(),
  contract: z.object({
    type: z.string().nullable(),
    name: z.string().nullable(),
    symbol: z.string().nullable(),
  }),
  collection: collectionSchema,
  extra_metadata: z
    .record(z.any())
    .and(
      z.object({
        image_original_url: z.string().optional().nullable(),
        animation_original_url: z.string().optional().nullable(),
        attributes: z
          .array(
            z.object({
              trait_type: z.string().nullable(),
              value: z.union([z.string().nullable(), z.number().nullable()]),
            }),
          )
          .optional()
          .nullable(),
      }),
    )
    .optional()
    .nullable(),
  queried_wallet_balances: z.array(tokenQuantitySchema).optional().nullable(),
});

export const nftsByOwnerSchema = z.object({
  next_cursor: z.string().optional().nullable(),
  next: z.string().optional().nullable(),
  previous: z.string().optional().nullable(),
  nfts: z.array(z.any()),
});
