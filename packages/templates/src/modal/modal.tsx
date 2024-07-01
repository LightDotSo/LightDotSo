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
  Sheet,
  SheetContent,
  SheetHeader,
} from "@lightdotso/ui";
import { cn } from "@lightdotso/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { Suspense, createContext, useContext } from "react";
import type { FC, ReactNode } from "react";

// -----------------------------------------------------------------------------
// Styles
// -----------------------------------------------------------------------------

const modalDialogVariants = cva(["flex max-h-[80%] flex-col"], {
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

export interface ModalProps extends VariantProps<typeof modalDialogVariants> {
  children: ReactNode;
  className?: string;
  isSheet?: boolean;
  headerContent?: ReactNode;
  bannerContent?: ReactNode;
  footerContent?: ReactNode;
  isOverflowHidden?: boolean;
  isHeightFixed?: boolean;
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
  isSheet = false,
  open,
  size,
  isOverflowHidden,
  isHeightFixed,
  headerContent,
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
      <Drawer
        shouldScaleBackground
        open={open}
        onClose={onClose}
        onOpenChange={change => {
          if (!change && onClose) {
            onClose();
          }
        }}
      >
        <DrawerContent>
          {headerContent && <DialogHeader>{headerContent}</DialogHeader>}
          {bannerContent && (
            <DialogHeader className="w-full justify-start space-x-0 overflow-x-scroll [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {bannerContent}
            </DialogHeader>
          )}
          <DrawerBody
            className={cn(
              "overflow-scroll [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
              isHeightFixed && "h-96",
              className,
            )}
          >
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

  if (isSheet) {
    return (
      <Sheet
        shouldScaleBackground
        open={open}
        onClose={onClose}
        onOpenChange={change => {
          if (!change && onClose) {
            onClose();
          }
        }}
      >
        <SheetContent>
          {headerContent && <SheetHeader>{headerContent}</SheetHeader>}
          {bannerContent && (
            <SheetHeader className="w-full justify-start space-x-0 overflow-x-scroll [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {bannerContent}
            </SheetHeader>
          )}
          <DrawerBody
            className={cn(
              "overflow-scroll [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
              className,
            )}
          >
            <ModalContext.Provider value={true}>
              <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                {children}
              </Suspense>
            </ModalContext.Provider>
          </DrawerBody>
        </SheetContent>
        {footerContent && <DrawerFooter>{footerContent}</DrawerFooter>}
      </Sheet>
    );
  }

  return (
    <Dialog open={open} defaultOpen={open} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent
          className={cn("w-full", modalDialogVariants({ size: size }))}
        >
          <DialogHeader className={cn(headerContent ? "justify-between" : "")}>
            {headerContent && headerContent}
            <ButtonIcon
              className="ml-4"
              size="sm"
              variant="shadow"
              onClick={onClose}
            >
              <X />
            </ButtonIcon>
          </DialogHeader>
          {bannerContent && (
            <DialogHeader className="w-full justify-start space-x-0 overflow-x-scroll [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {bannerContent}
            </DialogHeader>
          )}
          <DialogBody
            className={cn(
              !isOverflowHidden &&
                "overflow-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
              isHeightFixed ? "h-96" : "max-h-full",
              className,
            )}
          >
            <ModalContext.Provider value={true}>
              <Suspense
                fallback={
                  <Skeleton
                    className={cn("h-64 w-full", size === "lg" && "h-96")}
                  />
                }
              >
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
