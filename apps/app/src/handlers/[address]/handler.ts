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

import { withTimeout } from "@lightdotso/client";
import {
  getCachedConfiguration,
  getCachedWallet,
  getCachedWalletSettings,
} from "@lightdotso/services";
import { validateAddress } from "@lightdotso/validators";
import { Result } from "neverthrow";
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

  const walletPromise = getCachedWallet({
    address: params.address as Address,
  });

  const configurationPromise = getCachedConfiguration({
    address: params.address as Address,
  });

  const walletSettingsPromise = getCachedWalletSettings({
    address: params.address as Address,
  });

  const timeoutResult = await withTimeout(
    Promise.all([walletPromise, configurationPromise, walletSettingsPromise]),
    10000,
  );

  // ---------------------------------------------------------------------------
  // Parse
  // ---------------------------------------------------------------------------

  const res = timeoutResult.andThen(([wallet, configuration, walletSettings]) =>
    Result.combineWithAllErrors([wallet, configuration, walletSettings]),
  );

  return res.match(
    ([wallet, configuration, walletSettings]) => {
      return {
        wallet: wallet,
        configuration: configuration,
        walletSettings: walletSettings,
      };
    },
    () => {
      return notFound();
    },
  );
};
