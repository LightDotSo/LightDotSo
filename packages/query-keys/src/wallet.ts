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

import type {
  WalletListParams,
  WalletListCountParams,
  WalletParams,
} from "@lightdotso/params";
import { createQueryKeys } from "@lukemorales/query-key-factory";
import type { inferQueryKeys } from "@lukemorales/query-key-factory";

// -----------------------------------------------------------------------------
// Keys
// -----------------------------------------------------------------------------

export const wallet = createQueryKeys("wallet", {
  get: (params: WalletParams) => ({
    queryKey: [{ params: params }],
  }),
  list: (params: WalletListParams) => ({
    queryKey: [{ params: params }],
  }),
  listCount: (params: WalletListCountParams) => ({
    queryKey: [{ params: params }],
  }),
  billing: (params: WalletParams) => ({
    queryKey: [{ params: params }],
  }),
  features: (params: WalletParams) => ({
    queryKey: [{ params: params }],
  }),
  notificationSettings: (params: WalletParams) => ({
    queryKey: [{ params: params }],
  }),
  settings: (params: WalletParams) => ({
    queryKey: [{ params: params }],
  }),
  simulation: (params: WalletParams) => ({
    queryKey: [{ params: params }],
  }),
  create: () => ({
    queryKey: ["create"],
  }),
  update: () => ({
    queryKey: ["update"],
  }),
});

// -----------------------------------------------------------------------------
// Infer
// -----------------------------------------------------------------------------

export type WalletKeys = inferQueryKeys<typeof wallet>;
