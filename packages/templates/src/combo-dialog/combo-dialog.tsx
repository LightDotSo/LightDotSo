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
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@lightdotso/ui";
import { cn } from "@lightdotso/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { useState } from "react";
import type { FC, ReactNode } from "react";

// -----------------------------------------------------------------------------
// Styles
// -----------------------------------------------------------------------------

const comboDialogVariants = cva(["max-h-[80%]"], {
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

interface ComboDialogProps extends VariantProps<typeof comboDialogVariants> {
  children: ReactNode;
  className?: string;
  buttonTrigger: ReactNode;
  headerContent?: ReactNode;
  bannerContent?: ReactNode;
  footerContent?: ReactNode;
  isHeightFixed?: boolean;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const ComboDialog: FC<ComboDialogProps> = ({
  children,
  size,
  isHeightFixed,
  buttonTrigger,
  headerContent,
  bannerContent,
  footerContent,
}) => {
  // ---------------------------------------------------------------------------
  // State Hooks
  // ---------------------------------------------------------------------------

  const [open, setOpen] = useState(false);

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
      <Drawer shouldScaleBackground open={open} onOpenChange={setOpen}>
        <DrawerTrigger>{buttonTrigger}</DrawerTrigger>
        <DrawerContent>
          {headerContent && <DrawerHeader>{headerContent}</DrawerHeader>}
          <DrawerBody>
            {bannerContent && bannerContent}
            {children}
          </DrawerBody>
          {footerContent && <DrawerFooter>{footerContent}</DrawerFooter>}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>{buttonTrigger}</PopoverTrigger>
      <PopoverContent className="w-96 p-0">
        <div className={cn(comboDialogVariants({ size }))}>
          {bannerContent && (
            <div className="sticky top-0 block w-full justify-start space-x-0">
              {bannerContent}
            </div>
          )}
          <div
            className={cn(
              "overflow-scroll [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
              isHeightFixed && "h-96",
            )}
          >
            {children}
          </div>
          {footerContent && (
            <div className="block w-full justify-start space-x-0">
              {footerContent}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
