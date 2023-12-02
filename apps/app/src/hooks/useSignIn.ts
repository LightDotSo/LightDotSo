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

import { signIn as authSignIn } from "next-auth/react";
import { useCallback } from "react";
import { SiweMessage } from "siwe";
import { useNetwork, useSignMessage } from "wagmi";
import { useAuth } from "@/stores/useAuth";

export const useSignIn = () => {
  const { address } = useAuth();
  const { chain } = useNetwork();
  const { signMessageAsync } = useSignMessage();

  const signIn = useCallback(async () => {
    // First, construct the message to sign.
    const nonce = await fetch("/api/auth/nonce").then(res => res.text());

    if (!chain) return;

    const message = new SiweMessage({
      version: "1",
      uri: "https://light.so",
      domain: "light.so",
      address: address,
      chainId: chain.id,
      nonce: nonce,
      // Human-readable ASCII assertion that the user will sign, and it must not contain `\n`.
      statement: process.env.NEXT_PUBLIC_SIGNIN_MESSAGE,
    }).prepareMessage();

    // Then, sign the message.
    const signature = await signMessageAsync({ message });

    await authSignIn("credentials", {
      message: message,
      signature: signature,
      // callbackUrl: "/",
    });
  }, [address, chain, signMessageAsync]);

  return signIn;
};
