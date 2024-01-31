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

import type { UserOperationData } from "@lightdotso/data";
import type { UserOperation } from "@lightdotso/schemas";
import listJsonData from "./list.json";

export const userOperationCreateData: UserOperation = {
  chainId: BigInt(10),
  hash: "0x2a025fdf4bea72a04614d93d0c59483cb371a3fd03042bef7805ca176eb82580",
  nonce: BigInt(1),
  initCode: "0x",
  sender: "0xFbd80Fe5cE1ECe895845Fd131bd621e2B6A1345F",
  callData: "0x",
  callGasLimit: BigInt(1),
  verificationGasLimit: BigInt(1),
  preVerificationGas: BigInt(1),
  maxFeePerGas: BigInt(1),
  maxPriorityFeePerGas: BigInt(1),
  paymasterAndData: "0x",
  signature: "0x",
};
export const userOperationListData = listJsonData as UserOperationData[];
