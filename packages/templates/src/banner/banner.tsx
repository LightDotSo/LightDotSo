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

import { XMarkIcon } from "@heroicons/react/20/solid";
import { useBanners } from "@lightdotso/stores";
import type { Banner as BannerKind } from "@lightdotso/types";
import { cn } from "@lightdotso/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertTriangleIcon, BoltIcon, GamepadIcon } from "lucide-react";
import { type FC } from "react";

// -----------------------------------------------------------------------------
// Styles
// -----------------------------------------------------------------------------

const bannerVariants = cva(
  "flex items-center gap-x-2 px-6 py-2.5 sm:px-3.5 sm:before:flex-1",
  {
    variants: {
      intent: {
        demo: "border-border-purple bg-background-purple-weakest text-text-purple [&>svg]:text-text-purple",
        beta: "border-border-info bg-background-info-weakest text-text-info [&>svg]:text-text-info",
        outage:
          "border-border-warning bg-background-warning-weakest text-text-warning [&>svg]:text-text-warning",
      },
    },
    defaultVariants: {
      intent: "beta",
    },
  },
);

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export type BannerProps = VariantProps<typeof bannerVariants> & {
  kind: BannerKind;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const Banner: FC<BannerProps> = ({ kind }) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { isBetaClosed, toggleIsBetaClosed } = useBanners();

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (kind === "beta" && isBetaClosed) {
    return null;
  }

  return (
    <div className={cn(bannerVariants({ intent: kind }))}>
      {kind === "beta" && <BoltIcon className="size-4" aria-hidden="true" />}
      {kind === "demo" && <GamepadIcon className="size-6" aria-hidden="true" />}
      {kind === "outage" && (
        <AlertTriangleIcon className="size-4" aria-hidden="true" />
      )}
      <p className="text-sm leading-6">
        {kind === "demo" && "Demo"}
        {kind === "beta" && "Beta"}
        {kind === "outage" && "Outage"}
      </p>
      <div className="flex flex-1 justify-end">
        {kind === "beta" && (
          <button
            type="button"
            className="-m-3 p-3 focus-visible:outline-offset-[-4px]"
            onClick={toggleIsBetaClosed}
          >
            <span className="sr-only">Dismiss</span>
            <XMarkIcon className="size-5" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
};
