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

import type { Address, Hex } from "viem";

// -----------------------------------------------------------------------------
// Params
// -----------------------------------------------------------------------------

export type ConfigurationOperationParams = {
  address: Address | null | undefined;
  simulate: boolean | null | undefined;
};

export type ConfigurationOperationSimulationParams = Omit<
  ConfigurationOperationParams,
  "simulate"
> &
  Omit<ConfigurationOperationCreateBodyParams, "signedData">;

// -----------------------------------------------------------------------------
// Params Body
// -----------------------------------------------------------------------------

export type ConfigurationOperationCreateBodyParams = {
  threshold: number;
  ownerId: string;
  signedData: Hex;
  owners: {
    address: string;
    weight: number;
  }[];
};
