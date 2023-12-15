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

import { getNonce, postAuthVerify } from "@lightdotso/client";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogPortal,
  DialogOverlay,
  DialogTitle,
} from "@lightdotso/ui";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { SiweMessage } from "siwe";
import { useSignMessage, useNetwork } from "wagmi";
import { useAuth, useModals } from "@/stores";
import { errorToast, successToast } from "@/utils";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function AuthModal() {
  const { address, sessionId } = useAuth();
  const { signMessageAsync } = useSignMessage();
  const { chain } = useNetwork();
  const { isAuthModalVisible, hideAuthModal } = useModals();
  const router = useRouter();

  // ---------------------------------------------------------------------------
  // Hooks
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
          postAuthVerify({
            params: { query: { user_address: address } },
            body: { message: messageToSign, signature },
          }).then(res => {
            res.match(
              _ => {
                successToast("Successfully signed in!");
                router.back();
              },
              _ => {
                errorToast("Failed to sign in!");
              },
            );
          });
        });
      },
      err => {
        if (err instanceof Error) {
          errorToast(err.message);
          return;
        }
        if (typeof err === "string") {
          errorToast(err);
          return;
        }
      },
    );
  }, [address, chain, router, sessionId, signMessageAsync]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (isAuthModalVisible) {
    return (
      <Dialog open>
        <DialogPortal>
          <DialogOverlay onClick={hideAuthModal} />
          <DialogContent
            className="sm:max-w-md"
            onEscapeKeyDown={hideAuthModal}
          >
            <DialogHeader>
              <DialogTitle>Login</DialogTitle>
              <DialogDescription>
                Login with your wallet to access your account.
              </DialogDescription>
            </DialogHeader>
            <Button
              type="submit"
              size="sm"
              className="px-3"
              onClick={handleSignIn}
            >
              <span className="sr-only">Login</span>
              Login
            </Button>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    );
  }

  return null;
}

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

export default AuthModal;
