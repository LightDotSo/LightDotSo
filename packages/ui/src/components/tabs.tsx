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
    <TabsContext.Provider value={{ variant: variant }}>
      {children}
    </TabsContext.Provider>
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
          "relative py-1.5 text-text-weak transition-colors hover:text-text focus:outline-none disabled:text-text-weaker disabled:hover:text-text-weaker data-[state=active]:text-text data-[state=active]:before:absolute data-[state=active]:before:bottom-[0.75px] data-[state=active]:before:left-0 data-[state=active]:before:h-0.5 data-[state=active]:before:w-full data-[state=active]:before:rounded-full data-[state=active]:before:bg-text",
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
            "flex w-full items-center justify-center rounded-md px-3 py-1.5 hover:bg-background-stronger group-focus-visible:outline-none group-focus-visible:ring-2 group-focus-visible:ring-border-info group-focus-visible:ring-offset-2",
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
      "mt-2 overflow-scroll ring-offset-background [-ms-overflow-style:none] [scrollbar-width:none] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-info focus-visible:ring-offset-2 [&::-webkit-scrollbar]:hidden",
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
