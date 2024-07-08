// Copyright 2023-2024 LightDotSo.
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

/* eslint-disable jsx-a11y/heading-has-content, react/display-name */

import { cn } from "@lightdotso/utils";
import type { ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";

// -----------------------------------------------------------------------------
// Components
// -----------------------------------------------------------------------------

const H1 = forwardRef<HTMLHeadingElement, ComponentPropsWithoutRef<"h1">>(
  ({ className, ...props }, ref) => (
    <h1
      ref={ref}
      className={cn(
        "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
        className,
      )}
      {...props}
    />
  ),
);

const H2 = forwardRef<HTMLHeadingElement, ComponentPropsWithoutRef<"h2">>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn(
        "mt-10 scroll-m-20 border-b border-b-border pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0",
        className,
      )}
      {...props}
    />
  ),
);

const H3 = forwardRef<HTMLHeadingElement, ComponentPropsWithoutRef<"h3">>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "mt-8 scroll-m-20 text-2xl font-semibold tracking-tight",
        className,
      )}
      {...props}
    />
  ),
);

const H4 = forwardRef<HTMLHeadingElement, ComponentPropsWithoutRef<"h4">>(
  ({ className, ...props }, ref) => (
    <h4
      ref={ref}
      className={cn(
        "mt-8 scroll-m-20 text-xl font-semibold tracking-tight",
        className,
      )}
      {...props}
    />
  ),
);

const P = forwardRef<HTMLParagraphElement, ComponentPropsWithoutRef<"p">>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("leading-7 [&:not(:first-child)]:mt-6", className)}
      {...props}
    />
  ),
);

const BlockQuote = forwardRef<
  HTMLQuoteElement,
  ComponentPropsWithoutRef<"blockquote">
>(({ className, ...props }, ref) => (
  <blockquote
    ref={ref}
    className={cn(
      "mt-6 border-l-2 border-border pl-6 italic text-text-primary",
      className,
    )}
    {...props}
  />
));

const Table = forwardRef<HTMLTableElement, ComponentPropsWithoutRef<"table">>(
  ({ className, ...props }, ref) => (
    <table ref={ref} className={cn("w-full", className)} {...props} />
  ),
);

const THead = forwardRef<
  HTMLTableSectionElement,
  ComponentPropsWithoutRef<"thead">
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("", className)} {...props} />
));

const TBody = forwardRef<
  HTMLTableSectionElement,
  ComponentPropsWithoutRef<"tbody">
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn("", className)} {...props} />
));

const TR = forwardRef<HTMLTableRowElement, ComponentPropsWithoutRef<"tr">>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        "even:bg-background-weaker m-0 border-t border-border p-0",
        className,
      )}
      {...props}
    />
  ),
);

const TD = forwardRef<HTMLTableCellElement, ComponentPropsWithoutRef<"td">>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn(
        "border border-border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right",
        className,
      )}
      {...props}
    />
  ),
);

const TH = forwardRef<HTMLTableCellElement, ComponentPropsWithoutRef<"th">>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        "border border-border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right",
        className,
      )}
      {...props}
    />
  ),
);

const UL = forwardRef<HTMLUListElement, ComponentPropsWithoutRef<"ul">>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      className={cn("my-6 ml-6 list-disc [&>li]:mt-2", className)}
      {...props}
    />
  ),
);

const LI = forwardRef<HTMLLIElement, ComponentPropsWithoutRef<"li">>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn("", className)} {...props} />
  ),
);

const InlineCode = forwardRef<HTMLElement, ComponentPropsWithoutRef<"code">>(
  ({ className, ...props }, ref) => (
    <code
      ref={ref}
      className={cn(
        "relative rounded bg-background px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold text-text-primary",
        className,
      )}
      {...props}
    />
  ),
);

const Lead = forwardRef<HTMLParagraphElement, ComponentPropsWithoutRef<"p">>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-xl text-text-primary", className)}
      {...props}
    />
  ),
);

const Large = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("text-lg font-semibold text-text-primary", className)}
      {...props}
    />
  ),
);

const Small = forwardRef<HTMLElement, ComponentPropsWithoutRef<"small">>(
  ({ className, ...props }, ref) => (
    <small
      ref={ref}
      className={cn("text-sm font-medium leading-none", className)}
      {...props}
    />
  ),
);

const Subtle = forwardRef<HTMLParagraphElement, ComponentPropsWithoutRef<"p">>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-text-weak", className)}
      {...props}
    />
  ),
);

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

export {
  H1,
  H2,
  H3,
  H4,
  P,
  BlockQuote,
  Table,
  THead,
  TBody,
  TR,
  TD,
  TH,
  UL,
  LI,
  InlineCode,
  Lead,
  Large,
  Small,
  Subtle,
};
