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

"use client";

import { getNonce } from "@lightdotso/client";
import { useMutationAuthVerify } from "@lightdotso/query";
import { useAuth } from "@lightdotso/stores";
import { toast } from "@lightdotso/ui";
import { useSignMessage, useAccount } from "@lightdotso/wagmi";
import { useCallback } from "react";
import { SiweMessage } from "siwe";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const useSignInWithSiwe = () => {
  // ---------------------------------------------------------------------------
  // Wagmi
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

  const { verify, isVerifySuccess: isSuccess } = useMutationAuthVerify({
    address: address,
  });

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

        // @ts-ignore
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
    isSuccess,
  };
};
