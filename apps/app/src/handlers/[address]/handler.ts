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
  getConfigurationWithBackoff,
  getWalletSettingsWithBackoff,
  getWalletWithBackoff,
} from "@lightdotso/services";
import { validateAddress } from "@lightdotso/validators";
import { notFound } from "next/navigation";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

export const handler = async (params: { address: string }) => {
  // ---------------------------------------------------------------------------
  // Validators
  // ---------------------------------------------------------------------------

  if (!validateAddress(params.address)) {
    return notFound();
  }

  // ---------------------------------------------------------------------------
  // Fetch
  // ---------------------------------------------------------------------------

  const walletPromise = getWalletWithBackoff({
    address: params.address as Address,
  });

  const configPromise = getConfigurationWithBackoff({
    address: params.address as Address,
  });

  const walletSettingsPromise = getWalletSettingsWithBackoff({
    address: params.address as Address,
  });

  const [wallet, config, walletSettings] = await Promise.all([
    walletPromise,
    configPromise,
    walletSettingsPromise,
  ]);

  // ---------------------------------------------------------------------------
  // Parse
  // ---------------------------------------------------------------------------

  return {
    wallet: wallet,
    config: config,
    walletSettings: walletSettings,
  };
};
