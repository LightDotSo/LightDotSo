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

import type { SIWEConfig } from "connectkit";
import { ConnectKitProvider, SIWEProvider } from "connectkit";
import { getCsrfToken, signIn, getSession, signOut } from "next-auth/react";
import { SiweMessage } from "siwe";
import { WagmiConfig, createConfig, configureChains } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { publicProvider } from "wagmi/providers/public";
import { CHAINS as configuredChains } from "@/const/chains";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  configuredChains,
  [publicProvider()],
);

// Set up wagmi config
const config = createConfig({
  autoConnect: true,
  connectors: [
    new InjectedConnector({
      chains,
      options: {
        name: "Injected",
        shimDisconnect: true,
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
});

export const siweConfig: SIWEConfig = {
  getSession: async () => {
    const session = await getSession();
    console.info("sesion: ", session);
    if (!session) return null;
    return session.session;
  },
  getNonce: async () => {
    const nonce = await getCsrfToken();
    console.info("nonce: ", nonce);
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
    const response = await signIn("eth", {
      message: JSON.stringify(message),
      redirect: false,
      signature,
      // callbackUrl: "/",
    });
    console.info("response: ", response);
    if (response?.error) {
      console.error("Error occured:", response.error);
    }
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

function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiConfig config={config}>
      <SIWEProvider {...siweConfig} signOutOnNetworkChange={false}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </SIWEProvider>
    </WagmiConfig>
  );
}

export { Web3Provider };
