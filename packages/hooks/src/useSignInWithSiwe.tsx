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

"use client";

import { getNonce } from "@lightdotso/client";
import { useMutationAuthVerify } from "@lightdotso/query";
import { useAuth } from "@lightdotso/stores";
import { toast } from "@lightdotso/ui";
import { useSignMessage, useAccount } from "@lightdotso/wagmi";
import { useCallback } from "react";
import { SiweMessage } from "siwe";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const useSignInWithSiwe = () => {
  // ---------------------------------------------------------------------------
  // Wagmi Hooks
  // ---------------------------------------------------------------------------

  const { isPending, signMessageAsync } = useSignMessage();
  const { chain } = useAccount();

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { address, clientType, sessionId } = useAuth();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { verify } = useMutationAuthVerify({ address: address as Address });

  // ---------------------------------------------------------------------------
  // Callback Hooks
  // ---------------------------------------------------------------------------

  const handleSignIn = useCallback(async () => {
    if (!address || !chain || sessionId) {
      return;
    }

    const res = await getNonce();

    res.match(
      _ => {
        const message = new SiweMessage({
          domain: window.location.host,
          address,
          statement: "Sign in with Ethereum to light.so",
          uri: window.location.origin,
          version: "1",
          chainId: chain.id,
          nonce: res._unsafeUnwrap().nonce!,
        });
        const messageToSign = message.prepareMessage();

        signMessageAsync({
          message: message.prepareMessage(),
        }).then(signature => {
          verify({
            message: messageToSign,
            signature: signature,
          });
        });
      },
      err => {
        if (err instanceof Error) {
          toast.error(err.message);
        } else {
          toast.error("Failed to sign in!");
        }
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, chain, clientType, sessionId, signMessageAsync]);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    handleSignIn,
    isPending,
  };
};
