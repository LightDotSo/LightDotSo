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

import { INTERNAL_LINKS, SOCIAL_LINKS } from "@lightdotso/const";
import { useBanners } from "@lightdotso/stores";
import type { Banner as BannerKind } from "@lightdotso/types";
import { ButtonIcon } from "@lightdotso/ui";
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
import { PiTelegramLogoDuotone } from "react-icons/pi";

// -----------------------------------------------------------------------------
// Styles
// -----------------------------------------------------------------------------

const bannerVariants = cva(
  "sticky top-0 z-50 flex items-center gap-x-2 border-b px-6 py-2.5 opacity-100 sm:px-3.5 sm:before:flex-1",
  {
    variants: {
      intent: {
        demo: "border-border-purple-weaker bg-background-purple-weakest text-text-purple [&>svg]:text-text-purple",
        beta: "border-border-info-weak bg-background-info-weakest text-text-info [&>svg]:text-text-info",
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
        {kind === "beta" && "Private Beta"}
        {kind === "outage" && "Outage Alert"}
      </p>
      <span className="hidden md:inline-flex">&middot;</span>{" "}
      {kind === "beta" && (
        <div className="flex items-center text-sm">
          <p className="hidden leading-6 sm:block">
            Please report any issues to{" "}
          </p>
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
              <PiTelegramLogoDuotone className="size-4" />
            </a>
          </ButtonIcon>
        </div>
      )}
      {kind === "demo" && (
        <Link
          className="inline-flex items-center text-sm hover:underline"
          href="/?demo=true"
        >
          Go to home
          <Undo2Icon className="ml-2 size-4 shrink-0 opacity-50" />
        </Link>
      )}
      {kind === "outage" && (
        <a
          className="inline-flex items-center text-sm hover:underline"
          href={INTERNAL_LINKS["Status"]}
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn More
          <ArrowUpRight className="ml-2 size-4 shrink-0 opacity-50" />
        </a>
      )}
      {(kind === "beta" || kind === "demo") && (
        <>
          <span className="hidden md:inline-flex">&middot;</span>{" "}
          <a
            className="inline-flex items-center text-sm hover:underline"
            href={SOCIAL_LINKS["Waitlist"]}
            target="_blank"
            rel="noopener noreferrer"
          >
            Waitlist
            <ArrowUpRight className="ml-2 size-4 shrink-0 opacity-50" />
          </a>
        </>
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
