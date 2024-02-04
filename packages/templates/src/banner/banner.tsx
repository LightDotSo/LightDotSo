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

import { INTERNAL_LINKS, SOCIAL_LINKS } from "@lightdotso/const";
import { useBanners } from "@lightdotso/stores";
import type { Banner as BannerKind } from "@lightdotso/types";
import { Button, ButtonIcon } from "@lightdotso/ui";
import { cn } from "@lightdotso/utils";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { DiscordLogoIcon, TwitterLogoIcon } from "@radix-ui/react-icons";
import { cva, type VariantProps } from "class-variance-authority";
import {
  AlertTriangleIcon,
  ArrowUpRight,
  BoltIcon,
  GamepadIcon,
  Undo2Icon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, type FC } from "react";
import { FaTelegramPlane } from "react-icons/fa";

// -----------------------------------------------------------------------------
// Styles
// -----------------------------------------------------------------------------

const bannerVariants = cva(
  "flex items-center gap-x-2 border-b px-6 py-2.5 sm:px-3.5 sm:before:flex-1",
  {
    variants: {
      intent: {
        demo: "border-border-purple-weaker bg-background-purple-weakest text-text-purple [&>svg]:text-text-purple",
        beta: "border-border-info-weaker bg-background-info-weakest text-text-info [&>svg]:text-text-info",
        outage:
          "border-border-warning-weaker bg-background-warning-weakest text-text-warning [&>svg]:text-text-warning",
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
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!useBanners.persist.hasHydrated()) {
      useBanners.persist.rehydrate();
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (!useBanners.persist.hasHydrated() || (kind === "beta" && isBetaClosed)) {
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
        {kind === "demo" && "Demo Mode"}
        {kind === "beta" && "Public Beta"}
        {kind === "outage" && "Outage Alert"}
      </p>
      {kind === "beta" && (
        <div className="ml-4 flex items-center">
          <p className="text-xs leading-6">Please report any issues to </p>
          <ButtonIcon asChild size="xs" variant="link" intent="info">
            <a
              href={SOCIAL_LINKS["Twitter Shun"]}
              target="_blank"
              rel="noopener noreferrer"
            >
              <TwitterLogoIcon className="size-4" />
            </a>
          </ButtonIcon>
          <ButtonIcon asChild size="xs" variant="link" intent="info">
            <a
              href={SOCIAL_LINKS["Discord"]}
              target="_blank"
              rel="noopener noreferrer"
            >
              <DiscordLogoIcon className="size-4" />
            </a>
          </ButtonIcon>
          <ButtonIcon asChild size="xs" variant="link" intent="info">
            <a
              href={SOCIAL_LINKS["Telegram Support"]}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaTelegramPlane className="size-4" />
            </a>
          </ButtonIcon>
        </div>
      )}
      {kind === "demo" && (
        <Link
          className="ml-4 inline-flex text-xs hover:underline"
          href="/?demo=true"
        >
          Go to home
          <Undo2Icon className="ml-2 size-4 shrink-0 opacity-50" />
        </Link>
      )}
      {kind === "outage" && (
        <a
          className="ml-4 inline-flex text-xs hover:underline"
          href={INTERNAL_LINKS["Status"]}
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn More
          <ArrowUpRight className="ml-2 size-4 shrink-0 opacity-50" />
        </a>
      )}
      <div className="flex flex-1 justify-end">
        {kind === "beta" && (
          <ButtonIcon
            size="xs"
            variant="link"
            intent="info"
            onClick={toggleIsBetaClosed}
          >
            <>
              <XMarkIcon className="size-4" />
              <span className="sr-only">Dismiss</span>
            </>
          </ButtonIcon>
        )}
      </div>
    </div>
  );
};
