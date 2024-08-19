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

import {
  type GetWalletSettingsResponse,
  getWalletSettings as getClientWalletSettings,
} from "@lightdotso/client";
import type { WalletSettingsParams } from "@lightdotso/params";
import { cache } from "react";
import "server-only";

// -----------------------------------------------------------------------------
// Pre
// -----------------------------------------------------------------------------

export const preloadGetWalletSettings = (params: WalletSettingsParams) => {
  void getWalletSettings(params);
};

// -----------------------------------------------------------------------------
// Service
// -----------------------------------------------------------------------------

export const getWalletSettings = async (
  params: WalletSettingsParams,
): GetWalletSettingsResponse => {
  return await getClientWalletSettings(
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    { params: { query: { address: params.address! } } },
    "admin",
  );
};

// -----------------------------------------------------------------------------
// Cache
// -----------------------------------------------------------------------------

export const getCachedWalletSettings = cache(getWalletSettings);
