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
import { Suspense, createContext, useContext } from "react";
import type { FC, ReactNode } from "react";

// -----------------------------------------------------------------------------
// Styles
// -----------------------------------------------------------------------------

const modalDialogVariants = cva(["max-h-[80%]"], {
  variants: {
    size: {
      lg: "max-w-6xl",
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
  className?: string;
  isHidden?: boolean;
  headerContent?: ReactNode;
  bannerContent?: ReactNode;
  footerContent?: ReactNode;
  open?: boolean;
  onClose?: () => void;
}

// -----------------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------------

const ModalContext = createContext(false);

// -----------------------------------------------------------------------------
// Hooks
// -----------------------------------------------------------------------------

export function useIsInsideModal() {
  return useContext(ModalContext);
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const Modal: FC<ModalProps> = ({
  children,
  className,
  isHidden,
  open,
  size,
  bannerContent,
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
        <DrawerContent className={isHidden ? "hidden" : ""}>
          {bannerContent && <DialogHeader>{bannerContent}</DialogHeader>}
          <DrawerBody className={className}>
            <ModalContext.Provider value={true}>
              <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                {children}
              </Suspense>
            </ModalContext.Provider>
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
            "w-full",
            modalDialogVariants({ size }),
            isHidden && "hidden",
          )}
        >
          <DialogHeader>
            <ButtonIcon size="sm" variant="shadow" onClick={onClose}>
              <X />
            </ButtonIcon>
          </DialogHeader>
          {bannerContent && (
            <DialogHeader className="block w-full justify-start space-x-0">
              {bannerContent}
            </DialogHeader>
          )}
          <DialogBody className={cn("overflow-scroll", className)}>
            <ModalContext.Provider value={true}>
              <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                {children}
              </Suspense>
            </ModalContext.Provider>
          </DialogBody>
          {footerContent && (
            <DialogFooter className="block w-full justify-start space-x-0">
              {footerContent}
            </DialogFooter>
          )}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};
