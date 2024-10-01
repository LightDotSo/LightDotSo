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

export function decodeInitCodeToFactoryAndFactoryData(initCode: Hex): {
  factory: Hex;
  factoryData: Hex;
} {
  // Check if all required parameters are provided and valid
  if (
    initCode === "0x" ||
    initCode.length !== 66 ||
    initCode.slice(0, 2) !== "0x"
  ) {
    return {
      factory: "0x",
      factoryData: "0x",
    };
  }

  // Process each component
  const factoryHex = `0x${initCode.slice(2, 42)}` as Hex;
  const factoryDataHex = `0x${initCode.slice(42)}` as Hex;

  return {
    factory: factoryHex,
    factoryData: factoryDataHex,
  };
}

export function encodeFactoryAndFactoryDataToInitCode(
  factory: Hex,
  factoryData: Hex,
): Hex {
  // Check if all required parameters are provided and valid
  if (
    factory === "0x" ||
    factoryData === "0x" ||
    !isAddress(factory) ||
    factory.length !== 42 ||
    factory.slice(0, 2) !== "0x" ||
    factoryData.slice(0, 2) !== "0x"
  ) {
    return "0x";
  }

  return `0x${factory.slice(2)}${factoryData.slice(2)}` as Hex;
}
