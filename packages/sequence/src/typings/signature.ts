// Copyright 2023-2024 Light.
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

/* eslint-disable no-unused-vars */

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
