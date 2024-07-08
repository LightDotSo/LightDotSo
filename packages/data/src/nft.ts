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

// -----------------------------------------------------------------------------
// Data
// -----------------------------------------------------------------------------

export type NftData = {
  status: "minted" | "burned";
  nft_id: string | null;
  chain: string | null;
  contract_address: string | null;
  token_id: string | null;
  previews: {
    image_small_url?: string | null | undefined;
    image_medium_url?: string | null | undefined;
    image_large_url?: string | null | undefined;
    image_opengraph_url?: string | null | undefined;
    blurhash?: string | null | undefined;
  };
  owners: {
    owner_address: string | null;
    first_acquired_date: string | null;
    last_acquired_date: string | null;
    nft_id?: string | null | undefined;
    quantity?: number | null | undefined;
  }[];
  contract: {
    symbol: string | null;
    type: string | null;
    name: string | null;
  };
  collection: {
    name: string | null;
    description: string | null;
    collection_id: string | null;
    marketplace_pages: {
      marketplace_name: string | null;
      marketplace_collection_id: string | null;
      collection_url: string | null;
      verified: boolean | null;
    }[];
    floor_prices: {
      payment_token: {
        symbol: string | null;
        name: string | null;
        payment_token_id: string | null;
        address?: string | null | undefined;
        decimals?: number | null | undefined;
      };
      marketplace_id: string | null;
      value?: number | null | undefined;
    }[];
    image_url?: string | null | undefined;
    banner_image_url?: string | null | undefined;
    external_url?: string | null | undefined;
    twitter_username?: string | null | undefined;
    discord_url?: string | null | undefined;
    metaplex_mint?: string | null | undefined;
    metaplex_first_verified_creator?: string | null | undefined;
    spam_score?: number | null | undefined;
  };
  name?: string | null | undefined;
  description?: string | null | undefined;
  image_url?: string | null | undefined;
  video_url?: string | null | undefined;
  audio_url?: string | null | undefined;
  model_url?: string | null | undefined;
  background_color?: string | null | undefined;
  external_url?: string | null | undefined;
  created_date?: string | Date | null | undefined;
  token_count?: number | null | undefined;
  owner_count?: number | null | undefined;
  last_sale?:
    | {
        timestamp: string | null;
        transaction: string | null;
        marketplace_name: string | null;
        is_bundle_sale: boolean | null;
        payment_token: {
          symbol: string | null;
          name: string | null;
          payment_token_id: string | null;
          address?: string | null | undefined;
          decimals?: number | null | undefined;
        };
        from_address?: string | null | undefined;
        to_address?: string | null | undefined;
        quantity?: number | null | undefined;
        unit_price?: number | null | undefined;
        total_price?: number | null | undefined;
      }
    | null
    | undefined;
  extra_metadata?:
    | (Record<string, any> & {
        image_original_url?: string | null | undefined;
        animation_original_url?: string | null | undefined;
        attributes?:
          | {
              value: string | number | null;
              trait_type: string | null;
            }[]
          | null
          | undefined;
      })
    | null
    | undefined;
  queried_wallet_balances?:
    | {
        first_acquired_date: string | null;
        last_acquired_date: string | null;
        address: string | null;
        quantity?: number | null | undefined;
      }[]
    | null
    | undefined;
};

export type NftDataPage = {
  next_cursor: string | null;
  next: string | null;
  nfts: NftData[];
  previous?: any;
};
