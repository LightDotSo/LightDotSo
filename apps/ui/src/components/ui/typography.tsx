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

/* eslint-disable jsx-a11y/heading-has-content, react/display-name */

import { cn } from "@lightdotso/utils";
import { forwardRef } from "react";

const H1 = forwardRef<HTMLHeadingElement, React.ComponentPropsWithoutRef<"h1">>(
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

const H2 = forwardRef<HTMLHeadingElement, React.ComponentPropsWithoutRef<"h2">>(
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

const H3 = forwardRef<HTMLHeadingElement, React.ComponentPropsWithoutRef<"h3">>(
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

const H4 = forwardRef<HTMLHeadingElement, React.ComponentPropsWithoutRef<"h4">>(
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

const P = forwardRef<HTMLParagraphElement, React.ComponentPropsWithoutRef<"p">>(
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
  React.ComponentPropsWithoutRef<"blockquote">
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

const Table = forwardRef<
  HTMLTableElement,
  React.ComponentPropsWithoutRef<"table">
>(({ className, ...props }, ref) => (
  <table ref={ref} className={cn("w-full", className)} {...props} />
));

const THead = forwardRef<
  HTMLTableSectionElement,
  React.ComponentPropsWithoutRef<"thead">
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("", className)} {...props} />
));

const TBody = forwardRef<
  HTMLTableSectionElement,
  React.ComponentPropsWithoutRef<"tbody">
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn("", className)} {...props} />
));

const TR = forwardRef<
  HTMLTableRowElement,
  React.ComponentPropsWithoutRef<"tr">
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "m-0 border-t border-border p-0 even:bg-background-weaker",
      className,
    )}
    {...props}
  />
));

const TD = forwardRef<
  HTMLTableCellElement,
  React.ComponentPropsWithoutRef<"td">
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "border border-border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right",
      className,
    )}
    {...props}
  />
));

const TH = forwardRef<
  HTMLTableCellElement,
  React.ComponentPropsWithoutRef<"th">
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "border border-border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right",
      className,
    )}
    {...props}
  />
));

const UL = forwardRef<HTMLUListElement, React.ComponentPropsWithoutRef<"ul">>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      className={cn("my-6 ml-6 list-disc [&>li]:mt-2", className)}
      {...props}
    />
  ),
);

const LI = forwardRef<HTMLLIElement, React.ComponentPropsWithoutRef<"li">>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn("", className)} {...props} />
  ),
);

const InlineCode = forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"code">
>(({ className, ...props }, ref) => (
  <code
    ref={ref}
    className={cn(
      "relative rounded bg-background py-[0.2rem] px-[0.3rem] font-mono text-sm font-semibold text-text-primary",
      className,
    )}
    {...props}
  />
));

const Lead = forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<"p">
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xl text-text-primary", className)}
    {...props}
  />
));

const Large = forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("text-lg font-semibold text-text-primary", className)}
      {...props}
    />
  ),
);

const Small = forwardRef<HTMLElement, React.ComponentPropsWithoutRef<"small">>(
  ({ className, ...props }, ref) => (
    <small
      ref={ref}
      className={cn("text-sm font-medium leading-none", className)}
      {...props}
    />
  ),
);

const Subtle = forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<"p">
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-text-weak", className)} {...props} />
));

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
