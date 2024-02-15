// Copyright 2023-2024 Light, Inc.
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

import { getWalletBilling } from "@lightdotso/services";
import { Result } from "neverthrow";
import type { Address } from "viem";
import { handler as addressHandler } from "@/handlers/paths/[address]/handler";
import { validateAddress } from "@/handlers/validators/address";

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

export const handler = async (params: { address: string }) => {
  // ---------------------------------------------------------------------------
  // Validators
  // ---------------------------------------------------------------------------

  validateAddress(params.address);

  // ---------------------------------------------------------------------------
  // Fetch
  // ---------------------------------------------------------------------------

  const { wallet, config, walletSettings } = await addressHandler(params);

  const walletBillingPromise = getWalletBilling({
    address: params.address as Address,
  });

  const [walletBilling] = await Promise.all([walletBillingPromise]);

  // ---------------------------------------------------------------------------
  // Parse
  // ---------------------------------------------------------------------------

  const res = Result.combineWithAllErrors([walletBilling]);

  return res.match(
    ([walletBilling]) => {
      return {
        wallet: wallet,
        config: config,
        walletSettings: walletSettings,
        walletBilling: walletBilling,
      };
    },
    () => {
      return {
        wallet: wallet,
        config: config,
        walletSettings: walletSettings,
        walletBilling: {
          id: "",
        },
      };
    },
  );
};
