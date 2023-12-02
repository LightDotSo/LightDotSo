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

import type { Address } from "viem";

/* eslint-disable no-unused-vars */
export enum Contract {
  V010_FACTORY = "Factory",
  V060_ENTRYPOINT = "Entrypoint",
}

export const CONTRACT_ADDRESSES: {
  readonly [key in Contract]: Address;
} = {
  [Contract.V010_FACTORY]: "0x0000000000756D3E6464f5efe7e413a0Af1C7474",
  [Contract.V060_ENTRYPOINT]: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
};
