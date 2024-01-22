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
  DialogBody,
  DialogContent,
  DialogPortal,
  DialogOverlay,
  Skeleton,
  Drawer,
  DrawerContent,
  DialogFooter,
  DialogHeader,
  ButtonIcon,
  DrawerBody,
  DrawerFooter,
} from "@lightdotso/ui";
import { cn } from "@lightdotso/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { Suspense } from "react";
import type { FC, ReactNode } from "react";

// -----------------------------------------------------------------------------
// Styles
// -----------------------------------------------------------------------------

const modalDialogVariants = cva(["max-h-[80%]"], {
  variants: {
    size: {
      default: "max-w-3xl",
      sm: "max-w-md",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface ModalProps extends VariantProps<typeof modalDialogVariants> {
  children: ReactNode;
  footerContent?: ReactNode;
  open?: boolean;
  onClose?: () => void;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const Modal: FC<ModalProps> = ({
  children,
  open,
  size,
  footerContent,
  onClose,
}) => {
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
      <Drawer shouldScaleBackground open={open} onClose={onClose}>
        <DrawerContent>
          <DrawerBody>
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              {children}
            </Suspense>
          </DrawerBody>
          {footerContent && <DrawerFooter>{footerContent}</DrawerFooter>}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} defaultOpen={open} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent
          className={cn(
            "w-full overflow-scroll",
            modalDialogVariants({ size }),
          )}
        >
          <DialogHeader>
            <ButtonIcon size="sm" variant="shadow">
              <X />
            </ButtonIcon>
          </DialogHeader>
          <DialogBody>
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              {children}
            </Suspense>
          </DialogBody>
          {footerContent && <DialogFooter>{footerContent}</DialogFooter>}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};
