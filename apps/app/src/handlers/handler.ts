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
  ConfigurationData,
  WalletData,
  WalletSettingsData,
} from "@lightdotso/data";
import {
  getCachedWallet,
  getConfiguration,
  getWalletSettings,
} from "@lightdotso/services";
import { validateAddress } from "@lightdotso/validators";
import { Result } from "neverthrow";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

export const handler = async (searchParams: {
  address?: string;
}): Promise<{
  wallet: WalletData | null;
  config: ConfigurationData | null;
  walletSettings: WalletSettingsData | null;
}> => {
  // ---------------------------------------------------------------------------
  // Validators
  // ---------------------------------------------------------------------------

  if (!searchParams.address) {
    return {
      wallet: null,
      config: null,
      walletSettings: null,
    };
  }

  if (!validateAddress(searchParams.address)) {
    return {
      wallet: null,
      config: null,
      walletSettings: null,
    };
  }

  // ---------------------------------------------------------------------------
  // Fetch
  // ---------------------------------------------------------------------------

  const walletPromise = getCachedWallet({
    address: searchParams.address as Address,
  });

  const configPromise = getConfiguration({
    address: searchParams.address as Address,
  });

  const walletSettingsPromise = getWalletSettings({
    address: searchParams.address as Address,
  });

  const [wallet, config, walletSettings] = await Promise.all([
    walletPromise,
    configPromise,
    walletSettingsPromise,
  ]);

  // ---------------------------------------------------------------------------
  // Parse
  // ---------------------------------------------------------------------------

  const res = Result.combineWithAllErrors([wallet, config]);

  return res.match(
    ([wallet, config]) => {
      return {
        wallet: wallet as WalletData | null,
        config: config as ConfigurationData | null,
        walletSettings: walletSettings.unwrapOr({
          is_enabled_dev: false,
          is_enabled_testnet: false,
        }) as WalletSettingsData | null,
      };
    },
    () => {
      return {
        wallet: null,
        config: null,
        walletSettings: null,
      };
    },
  );
};
