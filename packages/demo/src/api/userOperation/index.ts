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

import type { UserOperationData } from "@lightdotso/data";
import type { UserOperation } from "@lightdotso/schemas";
import listJsonData from "./list.json";

export const userOperationCreateData: UserOperation = {
  chainId: BigInt(8453),
  hash: "0x2a025fdf4bea72a04614d93d0c59483cb371a3fd03042bef7805ca176eb82580",
  nonce: BigInt(0),
  initCode:
    "0x0000000000756d3e6464f5efe7e413a0af1c7474183815c806eedcf823b5a64f8528accf0d78edb31b7715f351e4c9b6d8b3ac69a16e094e0000000000000000000000000000000000000000000000000000018bac7d2d77",
  sender: "0xFbd80Fe5cE1ECe895845Fd131bd621e2B6A1345F",
  callData:
    "0xb61d27f60000000000000000000000004fd9d0ee6d6564e80a9ee00c0163fc952d0a45ed00000000000000000000000000000000000000000000000000038d7ea4c6800000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
  callGasLimit: BigInt(1),
  verificationGasLimit: BigInt(1),
  preVerificationGas: BigInt(1),
  maxFeePerGas: BigInt(1),
  maxPriorityFeePerGas: BigInt(1),
  paymasterAndData: "0x",
  signature: "0x",
};
export const userOperationListData = listJsonData as UserOperationData[];
