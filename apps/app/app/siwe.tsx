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

import type { SIWEConfig, SIWESession } from "connectkit";
import { useSIWE, useModal } from "connectkit";
import { useAccount } from "wagmi";
import { useState, useEffect } from "react";
import { Button } from "@lightdotso/ui";
import { SiweMessage } from "siwe";
import { getCsrfToken, signIn, getSession, signOut } from "next-auth/react";

export const siweConfig: SIWEConfig = {
  getSession: async () => {
    const session = await getSession();
    if (!session) return null;
    return session.session;
  },
  getNonce: async () => {
    const nonce = await getCsrfToken();
    if (!nonce) throw new Error();
    return nonce;
  },
  signOut: async () => {
    try {
      await signOut({ redirect: false });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  },
  verifyMessage: async ({ message, signature }) => {
    console.warn({ message, signature });
    const response = await signIn("eth", {
      message: JSON.stringify(message),
      redirect: false,
      signature,
      // callbackUrl: "/",
    });
    if (response?.error) {
      console.error("Error occured:", response.error);
    }
    console.warn(response);
    return response?.ok ?? false;
  },
  createMessage: ({ nonce, address, chainId }) =>
    new SiweMessage({
      version: "1",
      domain: window.location.host,
      uri: window.location.origin,
      address,
      chainId,
      nonce,
      // Human-readable ASCII assertion that the user will sign, and it must not contain `\n`.
      statement: process.env.NEXT_PUBLIC_SIGNIN_MESSAGE,
    }).prepareMessage(),
};

export const SIWEButton = () => {
  const { setOpen } = useModal();
  const { isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { data, isRejected, isLoading, isSignedIn, signOut, signIn } = useSIWE({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    onSignIn: (session?: SIWESession) => {
      // Do something with the data
    },
    onSignOut: () => {
      // Do something when signed out
    },
  });

  const handleSignIn = async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    await signIn()?.then((session?: SIWESession) => {
      // Do something when signed in
    });
  };

  const handleSignOut = async () => {
    await signOut()?.then(() => {
      // Do something when signed out
    });
  };

  if (!mounted) return <></>;

  /** Wallet is connected and signed in */
  if (isSignedIn) {
    return (
      <>
        <div>Address: {data?.address}</div>
        <div>ChainId: {data?.chainId}</div>
        <Button onClick={handleSignOut}>Sign Out</Button>
      </>
    );
  }

  /** Wallet is connected, but not signed in */
  if (isConnected) {
    return (
      <>
        <Button onClick={handleSignIn} disabled={isLoading}>
          {isRejected // User Rejected
            ? "Try Again"
            : isLoading // Waiting for signing request
            ? "Awaiting request..."
            : // Waiting for interaction
              "Sign In"}
        </Button>
      </>
    );
  }

  /** A wallet needs to be connected first */
  return (
    <>
      <Button onClick={() => setOpen(true)}>Connect Wallet</Button>
    </>
  );
};
