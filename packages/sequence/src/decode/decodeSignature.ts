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

// Copyright 2017-present Horizon Blockchain Games Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { SignatureType } from "../typings";
import { decodeSignatureBody } from "./decodeSignatureBody";

// Decode a signature.
// From: https://github.com/0xsequence/sequence.js/blob/3fa8067a5df6332784501794a90af583254e5b88/packages/core/src/v2/signature.ts#L532-L552
// License: Apache 2.0
export const decodeSignature = (signature: Uint8Array) => {
  const type = signature[0];

  switch (type) {
    case SignatureType.Legacy:
      return {
        type: type,
        body: decodeSignatureBody(signature),
      };
    case SignatureType.Dynamic:
      return {
        type: type,
        body: decodeSignatureBody(signature.slice(1)),
      };
    case SignatureType.NoChainIdDynamic:
      return {
        type: type,
        body: decodeSignatureBody(signature.slice(1)),
      };
    case SignatureType.Chained:
      // decodeChainedSignature(bytes);
      break;
    default:
      throw new Error(`Unsupported signature type: ${type}`);
  }
};
