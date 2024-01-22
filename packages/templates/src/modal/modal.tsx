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

import { useIsMounted, useMediaQuery } from "@lightdotso/hooks";
import {
  Dialog,
  DialogContent,
  DialogPortal,
  DialogOverlay,
  Skeleton,
  Drawer,
  DrawerContent,
} from "@lightdotso/ui";
import { Suspense } from "react";
import type { FC, ReactNode } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface ModalProps {
  children: ReactNode;
  onClose?: () => void;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const Modal: FC<ModalProps> = ({ children, onClose }) => {
  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const isMounted = useIsMounted();
  const isDesktop = useMediaQuery("md");

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (!isMounted) {
    return null;
  }

  if (!isDesktop) {
    return (
      <Drawer shouldScaleBackground open={true} onClose={onClose}>
        <DrawerContent>
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            {children}
          </Suspense>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={true} defaultOpen={true} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent className="w-full overflow-scroll sm:max-h-[80%] sm:max-w-3xl">
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            {children}
          </Suspense>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};
