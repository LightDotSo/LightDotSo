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

import { verifyUserId } from "@/auth";
import { handler as addressHandler } from "@/handlers/[address]/handler";
import { getCachedWalletNotificationSettings } from "@lightdotso/services";
import { validateAddress } from "@lightdotso/validators";
import { Result } from "neverthrow";
import { notFound } from "next/navigation";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

export const handler = async (params: { address: string }) => {
  // ---------------------------------------------------------------------------
  // Auth
  // ---------------------------------------------------------------------------

  const userId = await verifyUserId();

  // ---------------------------------------------------------------------------
  // Validators
  // ---------------------------------------------------------------------------

  if (!validateAddress(params.address)) {
    return notFound();
  }

  // ---------------------------------------------------------------------------
  // Fetch
  // ---------------------------------------------------------------------------

  const { wallet, configuration, walletSettings } =
    await addressHandler(params);

  const walletNotificationsPromise = getCachedWalletNotificationSettings({
    address: params.address as Address,
    user_id: userId,
  });

  const [walletNotifications] = await Promise.all([walletNotificationsPromise]);

  // ---------------------------------------------------------------------------
  // Parse
  // ---------------------------------------------------------------------------

  const res = Result.combineWithAllErrors([walletNotifications]);

  return res.match(
    ([walletNotifications]) => {
      return {
        wallet: wallet,
        configuration: configuration,
        walletSettings: walletSettings,
        walletNotifications: walletNotifications,
      };
    },
    () => {
      return {
        wallet: wallet,
        configuration: configuration,
        walletSettings: walletSettings,
        walletNotifications: {
          id: "",
          settings: [],
        },
      };
    },
  );
};
