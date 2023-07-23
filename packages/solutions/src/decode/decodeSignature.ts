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
        type,
        body: decodeSignatureBody(signature.slice(1)),
      };
    case SignatureType.Dynamic:
      return {
        type,
        body: decodeSignatureBody(signature.slice(1)),
      };
    case SignatureType.NoChainIdDynamic:
      return {
        type,
        body: decodeSignatureBody(signature.slice(1)),
      };
    case SignatureType.Chained:
      // decodeChainedSignature(bytes);
      break;
    default:
      throw new Error(`Unsupported signature type: ${type}`);
  }
};
