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

export enum Chain {
  MAINNET = "ethereum",
  OPTIMISM = "optimism",
  CELO = "celo",
  POLYGON = "polygon",
  BASE = "base",
  ARBITRUM = "arbitrum",
  AVALANCHE = "avalanche",
  GNOSIS = "gnosis",
  SEPOLIA = "sepolia",
}

export const ChainIds: { readonly [key in Chain]: number } = {
  [Chain.MAINNET]: 1,
  [Chain.OPTIMISM]: 10,
  [Chain.GNOSIS]: 100,
  [Chain.POLYGON]: 137,
  [Chain.BASE]: 8453,
  [Chain.ARBITRUM]: 42161,
  [Chain.AVALANCHE]: 43114,
  [Chain.CELO]: 42220,
  [Chain.SEPOLIA]: 11155111,
};
