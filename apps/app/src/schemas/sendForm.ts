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

import * as z from "zod";

// -----------------------------------------------------------------------------
// Schema
// -----------------------------------------------------------------------------

const erc20 = z.object({
  address: z.string().optional(),
  name: z.string().optional(),
  decimals: z.number().optional(),
  quantity: z.number().optional(),
});

const erc721 = z.object({
  address: z.string().optional(),
  name: z.string().optional(),
  tokenId: z.number().optional(),
  quantity: z.number().optional(),
});

const erc1155 = z.object({
  address: z.string().optional(),
  name: z.string().optional(),
  tokenIds: z.array(z.number()),
  quantities: z.array(z.number()),
});

const asset = z.union([erc20, erc721, erc1155]);

const transfer = z.object({
  address: z.string().optional(),
  addressOrEns: z.string().optional(),
  asset: asset.optional(),
  assetType: z.string().optional(),
  chainId: z.number().optional(),
});

const transfers = z.array(transfer);

export const sendFormConfigurationSchema = z.object({
  transfers: transfers,
});

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type Asset = z.infer<typeof asset>;
export type Transfer = z.infer<typeof transfer>;
export type Transfers = z.infer<typeof transfers>;
export type SendFormConfiguration = z.infer<typeof sendFormConfigurationSchema>;
