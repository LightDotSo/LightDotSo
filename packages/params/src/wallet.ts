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

import type { WalletData } from "@lightdotso/data";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Params
// -----------------------------------------------------------------------------

export type WalletParams = {
  address: Address;
};

export type WalletListParams = {
  address: Address | null;
  limit: number;
  offset: number;
  user_id?: string;
};

export type WalletListCountParams = Omit<WalletListParams, "limit" | "offset">;

// -----------------------------------------------------------------------------
// Params Body
// -----------------------------------------------------------------------------

export type WalletCreateBodyParams = {
  address: Address;
  simulate: boolean;
  name: string;
  threshold: number;
  owners: {
    address: Address;
    weight: number;
  }[];
  invite_code: string;
  salt: string;
};

export type WalletUpdateBodyParams = Partial<WalletData>;
