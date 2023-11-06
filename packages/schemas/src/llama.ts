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

export const underlyingSchema = z.object({
  address: z.string(),
  symbol: z.string(),
  decimals: z.number(),
  price: z.number(),
  amount: z.string(),
  balanceUSD: z.number(),
  name: z.string().optional(),
  stable: z.boolean().optional(),
});

export const balanceSchema = z.object({
  address: z.string(),
  symbol: z.string(),
  decimals: z.number(),
  category: z.string().optional(),
  stable: z.boolean().optional(),
  price: z.number(),
  amount: z.string(),
  balanceUSD: z.number(),
  rewardUSD: z.number().optional(),
  debtUSD: z.number().optional(),
  apy: z.number().optional(),
  apyBase: z.number().optional(),
  apyMean30d: z.number().optional(),
  ilRisk: z.boolean().optional(),
  name: z.string().optional(),
  collateralUSD: z.number().optional(),
  underlyings: z.array(underlyingSchema).optional(),
});

export const groupSchema = z.object({
  fromAddress: z.string().optional(),
  balanceUSD: z.number(),
  debtUSD: z.number().optional(),
  rewardUSD: z.number().optional(),
  healthFactor: z.number().optional(),
  balances: z.array(balanceSchema),
});

export const protocolSchema = z.object({
  id: z.string(),
  chain: z.string(),
  balanceUSD: z.number(),
  debtUSD: z.number(),
  rewardUSD: z.number(),
  groups: z.array(groupSchema),
});

export const llamaSchema = z.object({
  status: z.string(),
  updatedAt: z.number(),
  nextUpdateAt: z.number(),
  protocols: z.array(protocolSchema),
});
