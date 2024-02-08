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

import { getWalletNotificationSettings } from "@lightdotso/services";
import { Result } from "neverthrow";
import type { Address } from "viem";
import { verifyUserId } from "@/auth";
import { handler as addressHandler } from "@/handlers/paths/[address]/handler";
import { validateAddress } from "@/handlers/validators/address";

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

  validateAddress(params.address);

  // ---------------------------------------------------------------------------
  // Fetch
  // ---------------------------------------------------------------------------

  const { wallet, config, walletSettings } = await addressHandler(params);

  const walletNotificationsPromise = getWalletNotificationSettings({
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
        config: config,
        walletSettings: walletSettings,
        walletNotifications: walletNotifications,
      };
    },
    () => {
      return {
        wallet: wallet,
        config: config,
        walletSettings: walletSettings,
        walletNotifications: {
          id: "",
        },
      };
    },
  );
};
