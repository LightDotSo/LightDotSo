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

import { describe, expect, it } from "vitest";
import {
  decodeInitCodeToFactoryAndFactoryData,
  encodeFactoryAndFactoryDataToInitCode,
} from "../src";

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

describe("decodeInitCodeToFactoryAndFactoryData Tests", () => {
  it("should return null for empty init code", () => {
    const initCode = "0x";
    const result = decodeInitCodeToFactoryAndFactoryData(initCode);
    expect(result).toEqual({
      factory: null,
      factoryData: null,
    });
  });

  it("should correctly  valid inputs", () => {
    const initCode = "0x1234567890123456789012345678901234567890abcdef";

    const result = decodeInitCodeToFactoryAndFactoryData(initCode);

    const expected = {
      factory: "0x1234567890123456789012345678901234567890",
      factoryData: "0xabcdef",
    };
    expect(result).toEqual(expected);
  });
});

describe("encodeFactoryAndFactoryDataToInitCode Tests", () => {
  it("should correctly pack valid inputs", () => {
    const factory = "0x1234567890123456789012345678901234567890";
    const factoryData = "0xabcdef";

    const result = encodeFactoryAndFactoryDataToInitCode(factory, factoryData);

    const expected = `0x${factory.slice(2)}${factoryData.slice(2)}`;
    expect(result).toBe(expected);
  });
});

describe("decode/encode packedInitCode Tests", () => {
  it("should correctly decode and encode a valid packed init code", () => {
    const factory = "0x1234567890123456789012345678901234567890";
    const factoryData = "0xabcdef";

    const initCode = encodeFactoryAndFactoryDataToInitCode(
      factory,
      factoryData,
    );

    const decodedData = decodeInitCodeToFactoryAndFactoryData(initCode);

    expect(decodedData).toEqual({
      factory: factory,
      factoryData: factoryData,
    });
  });
});
