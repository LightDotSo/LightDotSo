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

// From: https://github.com/0xsequence/sequence.js/blob/3fa8067a5df6332784501794a90af583254e5b88/packages/core/src/v2/signature.ts#L8-L13
// License: Apache 2.0
export enum SignatureType {
  Legacy = 0,
  Dynamic = 1,
  NoChainIdDynamic = 2,
  Chained = 3,
}

// From: https://github.com/0xsequence/sequence.js/blob/3fa8067a5df6332784501794a90af583254e5b88/packages/core/src/v2/signature.ts#L15-L23
// License: Apache 2.0
export enum SignaturePartType {
  Signature = 0,
  Address = 1,
  DynamicSignature = 2,
  Node = 3,
  Branch = 4,
  Subdigest = 5,
  Nested = 6,
}
