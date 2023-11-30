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

import { z } from "zod";

export const paymentTokenSchema = z.object({
  payment_token_id: z.string(),
  name: z.string(),
  symbol: z.string(),
  address: z.string().optional(),
  decimals: z.number(),
});

export const saleSchema = z.object({
  from_address: z.string().optional(),
  to_address: z.string().optional(),
  quantity: z.number(),
  timestamp: z.string(),
  transaction: z.string(),
  marketplace_name: z.string(),
  is_bundle_sale: z.boolean(),
  payment_token: paymentTokenSchema,
  unit_price: z.number(),
  total_price: z.number(),
});

export const collectionInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  chain: z.string(),
});

export const ownerSchema = z.object({
  nft_id: z.string().optional(),
  owner_address: z.string(),
  quantity: z.number(),
  first_acquired_date: z.string(),
  last_acquired_date: z.string(),
});

export const floorPriceSchema = z.object({
  marketplace_id: z.string(),
  value: z.number(),
  payment_token: paymentTokenSchema,
});

export const tokenQuantitySchema = z.object({
  address: z.string(),
  quantity: z.number(),
  first_acquired_date: z.string(),
  last_acquired_date: z.string(),
});

export const saleDetailsSchema = z.object({
  marketplace_name: z.string(),
  is_bundle_sale: z.boolean(),
  payment_token: paymentTokenSchema,
  unit_price: z.number(),
  total_price: z.number(),
});

export const transferSchema = z.object({
  nft_id: z.string(),
  chain: z.string(),
  contract_address: z.string(),
  token_id: z.null(),
  from_address: z.string().optional(),
  to_address: z.string(),
  quantity: z.number(),
  timestamp: z.string(),
  block_number: z.number(),
  block_hash: z.string().optional(),
  transaction: z.string(),
  log_index: z.number(),
  batch_transfer_index: z.number(),
  sale_details: saleDetailsSchema.optional(),
});

export const collectionSchema = z.object({
  collection_id: z.string(),
  name: z.string(),
  description: z.string(),
  image_url: z.string().optional(),
  banner_image_url: z.string().optional(),
  external_url: z.string().optional(),
  twitter_username: z.string().optional(),
  discord_url: z.string().optional(),
  marketplace_pages: z.array(
    z.object({
      marketplace_name: z.string(),
      marketplace_collection_id: z.string(),
      collection_url: z.string(),
      verified: z.boolean(),
    }),
  ),
  metaplex_mint: z.string().optional(),
  metaplex_first_verified_creator: z.string().optional(),
  spam_score: z.number(),
  floor_prices: z.array(floorPriceSchema),
});

export const nftSchema = z.object({
  nft_id: z.string(),
  chain: z.string(),
  contract_address: z.string(),
  token_id: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  image_url: z.string().optional(),
  video_url: z.string().optional(),
  audio_url: z.string().optional(),
  model_url: z.string().optional(),
  previews: z.object({
    image_small_url: z.string().optional(),
    image_medium_url: z.string().optional(),
    image_large_url: z.string().optional(),
    image_opengraph_url: z.string().optional(),
    blurhash: z.string().optional(),
  }),
  background_color: z.string().optional(),
  external_url: z.string().optional(),
  created_date: z.date().optional(),
  status: z.union([z.literal("minted"), z.literal("burned")]),
  token_count: z.number(),
  owner_count: z.number(),
  owners: z.array(ownerSchema),
  last_sale: saleSchema.optional(),
  contract: z.object({
    type: z.string(),
    name: z.string(),
    symbol: z.string(),
  }),
  collection: collectionSchema,
  extra_metadata: z
    .record(z.any())
    .and(
      z.object({
        image_original_url: z.string().optional(),
        animation_original_url: z.string().optional(),
        attributes: z
          .array(
            z.object({
              trait_type: z.string(),
              value: z.union([z.string(), z.number()]),
            }),
          )
          .optional(),
      }),
    )
    .optional(),
  queried_wallet_balances: z.array(tokenQuantitySchema).optional(),
});

export const nftsByOwnerSchema = z.object({
  next_cursor: z.string(),
  next: z.string(),
  previous: z.any(),
  nfts: z.array(nftSchema),
});
