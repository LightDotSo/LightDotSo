// Copyright 2023-2024 Light, Inc.
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

import type { Address } from "viem";

/* eslint-disable no-unused-vars */
export enum Contract {
  V010_FACTORY = "v0.1.0 Factory",
  V060_ENTRYPOINT = "Entrypoint",
}

export const CONTRACT_ADDRESSES: {
  readonly [key in Contract]: Address;
} = {
  [Contract.V010_FACTORY]: "0x0000000000756D3E6464f5efe7e413a0Af1C7474",
  [Contract.V060_ENTRYPOINT]: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
};
