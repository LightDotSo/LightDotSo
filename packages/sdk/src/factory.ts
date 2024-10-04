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

import type { Hex } from "viem";
import { isAddress } from "viem";

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

export const decodeInitCodeToFactoryAndFactoryData = (
  initCode: Hex | null | undefined,
): {
  factory: Hex | null;
  factoryData: Hex | null;
} => {
  // Check if all required parameters are provided and valid
  if (
    !initCode ||
    initCode === "0x" ||
    (initCode && initCode?.length < 44) ||
    (initCode && initCode?.slice(0, 2) !== "0x")
  ) {
    return {
      factory: null,
      factoryData: null,
    };
  }

  // Process each component
  const factoryHex = `0x${initCode?.slice(2, 42)}` as Hex;
  const factoryDataHex = `0x${initCode?.slice(42)}` as Hex;

  return {
    factory: factoryHex,
    factoryData: factoryDataHex,
  };
};

export const encodeFactoryAndFactoryDataToInitCode = (
  factory: Hex | null | undefined,
  factoryData: Hex | null | undefined,
): Hex => {
  // Check if all required parameters are provided and valid
  if (
    !factory ||
    factory === "0x" ||
    !isAddress(factory) ||
    !factoryData ||
    factoryData === "0x" ||
    factory.slice(0, 2) !== "0x" ||
    factoryData.slice(0, 2) !== "0x"
  ) {
    return "0x";
  }

  return `0x${factory?.slice(2)}${factoryData?.slice(2)}` as Hex;
};
