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
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPortal,
  DialogOverlay,
  DialogTitle,
  Input,
  Label,
} from "@lightdotso/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Copy } from "lucide-react";
import type { NonceData } from "@/data";
import { queries } from "@/queries";
import { useAuth } from "@/stores/useAuth";
import { useModals } from "@/stores/useModals";
import { successToast } from "@/utils";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function AuthModal() {
  const { address } = useAuth();
  const { isAuthModalVisible, hideAuthModal } = useModals();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { data: nonce } = useSuspenseQuery<NonceData | null>({
    queryKey: queries.nonce.get(address).queryKey,
    queryFn: async () => {
      if (!address) {
        return null;
      }

      const res = await getNonce({});

      // Return if the response is 200
      return res.match(
        data => {
          return data;
        },
        _ => {
          return null;
        },
      );
    },
  });

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
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="link" className="sr-only">
                  Link
                </Label>
                <Input
                  readOnly
                  id="link"
                  defaultValue="https://ui.shadcn.com/docs/installation"
                />
              </div>
              <Button
                type="submit"
                size="sm"
                className="px-3"
                onClick={() => {
                  successToast(nonce);
                }}
              >
                <span className="sr-only">Copy</span>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <DialogFooter className="sm:justify-start">
              <Button type="button" onClick={hideAuthModal}>
                Close
              </Button>
            </DialogFooter>
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
