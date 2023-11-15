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

import type { Chain } from "@covalenthq/client-sdk";

export const ChainIdMapping: Record<number, Chain> = {
  1: "eth-mainnet",
  10: "optimism-mainnet",
  100: "gnosis-mainnet",
  137: "matic-mainnet",
  8453: "base-mainnet",
};
