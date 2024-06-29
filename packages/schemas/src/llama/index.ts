// Copyright 2023-2024 Light.
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

export const llamaGetSchema = z.object({
  status: z.string(),
  updatedAt: z.number().optional(),
  nextUpdateAt: z.number(),
  protocols: z.array(protocolSchema),
});

export const llamaPostSchema = z.object({
  status: z.string(),
  updatedAt: z.number(),
  nextUpdateAt: z.number(),
});
