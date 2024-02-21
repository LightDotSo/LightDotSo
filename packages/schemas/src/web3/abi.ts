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

import {
  Abi as zodAbi,
  Address as zodAddress,
  AbiParameter as zodArgument,
  SolidityAddress,
  SolidityBool,
  SolidityBytes,
  SolidityFunction,
  SolidityString,
  SolidityInt,
  SolidityArrayWithoutTuple,
} from "abitype/zod";
import { z } from "zod";

// -----------------------------------------------------------------------------
// Schema
// -----------------------------------------------------------------------------

export const abi = z.object({
  abi: zodAbi,
  abiString: z.string(),
  abiArguments: z.array(
    zodArgument,
    z.object({
      value: z.union([
        SolidityAddress,
        SolidityBool,
        SolidityBytes,
        SolidityFunction,
        SolidityString,
        SolidityInt,
        SolidityArrayWithoutTuple,
      ]),
    }),
  ),
  address: zodAddress,
  functionName: z.string(),
});

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type Abi = z.infer<typeof abi>;
