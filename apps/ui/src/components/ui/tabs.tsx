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

import { cn } from "@lightdotso/utils";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { createContext, forwardRef, useContext } from "react";

// -----------------------------------------------------------------------------
// Hooks
// -----------------------------------------------------------------------------

const TabsContext = createContext<VariantProps<typeof tabsVariants>>({
  variant: "default",
});

// -----------------------------------------------------------------------------
// Components
// -----------------------------------------------------------------------------

const tabsVariants = cva("", {
  variants: {
    variant: {
      default: "",
      outline: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});
const Tabs = forwardRef<
  ElementRef<typeof TabsPrimitive.Root>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Root> &
    VariantProps<typeof tabsVariants>
>(({ variant, children, ...props }, ref) => (
  <TabsPrimitive.Root ref={ref} {...props}>
    <TabsContext.Provider value={{ variant }}>{children}</TabsContext.Provider>
  </TabsPrimitive.Root>
));
Tabs.displayName = TabsPrimitive.Root.displayName;

const tabsListVariants = cva(
  "inline-flex h-10 items-center justify-center rounded-md p-1 text-text-weak",
  {
    variants: {
      variant: {
        default: "bg-background-stronger",
        outline: "space-x-1",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);
const TabsList = forwardRef<
  ElementRef<typeof TabsPrimitive.List>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.List> &
    VariantProps<typeof tabsListVariants>
>(({ className, variant, ...props }, ref) => {
  const context = useContext(TabsContext);

  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        tabsListVariants({
          variant: context.variant || variant,
        }),
        className,
      )}
      {...props}
    />
  );
});
TabsList.displayName = TabsPrimitive.List.displayName;

const tabsTriggerVariants = cva(
  "group inline-flex items-center justify-center whitespace-nowrap rounded-sm text-sm font-medium ring-offset-background transition-all disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "px-3 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-info focus-visible:ring-offset-2 data-[state=active]:bg-background data-[state=active]:text-text data-[state=active]:shadow-sm",
        outline: [
          "relative py-2 text-text-weak transition-colors hover:text-text focus:outline-none disabled:text-text-weaker disabled:hover:text-text-weaker data-[state=active]:text-text data-[state=active]:before:absolute data-[state=active]:before:bottom-[0.75px] data-[state=active]:before:left-0 data-[state=active]:before:h-0.5 data-[state=active]:before:w-full data-[state=active]:before:rounded-full data-[state=active]:before:bg-text",
        ],
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);
const TabsTrigger = forwardRef<
  ElementRef<typeof TabsPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> &
    VariantProps<typeof tabsTriggerVariants>
>(({ className, variant, children, ...props }, ref) => {
  const context = useContext(TabsContext);

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        tabsTriggerVariants({
          variant: context.variant || variant,
        }),
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          (context.variant || variant) === "outline" &&
            "flex items-center justify-center w-full px-3 py-1.5 hover:bg-background-stronger rounded-md group-focus-visible:outline-none group-focus-visible:ring-2 group-focus-visible:ring-border-info group-focus-visible:ring-offset-2",
        )}
      >
        {children}
      </span>
    </TabsPrimitive.Trigger>
  );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = forwardRef<
  ElementRef<typeof TabsPrimitive.Content>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-info focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

export { Tabs, TabsList, TabsTrigger, TabsContent };
