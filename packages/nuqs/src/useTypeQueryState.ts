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

import { useQueryState } from "nuqs";
import { parseAsStringEnum } from "nuqs/server";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export enum WalletType {
  // biome-ignore lint/style/useNamingConvention: <explanation>
  MULTI = "multi",
  // biome-ignore lint/style/useNamingConvention: <explanation>
  PERSONAL = "personal",
  "2FA" = "2fa",
}

// -----------------------------------------------------------------------------
// Parser
// -----------------------------------------------------------------------------

export const typeParser = parseAsStringEnum<WalletType>(
  Object.values(WalletType),
).withDefault(WalletType.MULTI);

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useTypeQueryState = () => {
  return useQueryState("type", typeParser);
};
