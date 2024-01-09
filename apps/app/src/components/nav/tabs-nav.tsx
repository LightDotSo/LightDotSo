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

// Full complete example from: https://github.com/hqasmei/youtube-tutorials/blob/ee44df8fbf6ab4f4c2f7675f17d67813947a7f61/vercel-animated-tabs/src/components/tabs.tsx
// License: MIT

import { Badge } from "@lightdotso/ui";
import { cn } from "@lightdotso/utils";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import type { FC } from "react";
import { isAddress } from "viem";
import type { Tab } from "@/hooks";

// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

const transition = {
  type: "tween",
  ease: "easeOut",
  duration: 0.15,
};

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type TabNavProps = {
  setSelectedTabIndex: (_index: number) => void;
  selectedTabIndex: number | undefined;
  tabs: Tab[];
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const TabsNav: FC<TabNavProps> = ({
  tabs,
  selectedTabIndex,
  setSelectedTabIndex,
}) => {
  // ---------------------------------------------------------------------------
  // State Hooks
  // ---------------------------------------------------------------------------

  const [anchorRefs, setAnchorRefs] = useState<Array<HTMLAnchorElement | null>>(
    [],
  );
  const [isAnimated, setIsAnimated] = useState(false);

  // ---------------------------------------------------------------------------
  // Next Hooks
  // ---------------------------------------------------------------------------

  const router = useRouter();
  const pathname = usePathname();

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const firstSlug = useMemo(() => {
    // Split the path using '/' as delimiter and remove empty strings
    const slugs = pathname.split("/").filter(slug => slug);

    // If the first slug is `demo`, return `/demo`
    if (slugs.length > 0 && slugs[0] === "demo") {
      return "/demo";
    }

    // Return the first slug if it is an address
    return slugs.length > 0 && isAddress(slugs[0]) ? "/" + slugs[0] : "";
  }, [pathname]);

  // ---------------------------------------------------------------------------
  // Ref Hooks
  // ---------------------------------------------------------------------------

  const navRef = useRef<HTMLDivElement>(null);

  // ---------------------------------------------------------------------------
  // State Hooks
  // ---------------------------------------------------------------------------

  const [hoveredTabIndex, setHoveredTabIndex] = useState<number | null>(null);

  // ---------------------------------------------------------------------------
  // Local Variables
  // ---------------------------------------------------------------------------

  const navRect = navRef.current?.getBoundingClientRect();

  const selectedRect =
    selectedTabIndex !== undefined
      ? anchorRefs[selectedTabIndex]?.getBoundingClientRect()
      : undefined;

  const hoveredRect =
    anchorRefs[hoveredTabIndex ?? -1]?.getBoundingClientRect();

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  // Set the anchor refs array length to the tabs length
  useEffect(() => {
    setAnchorRefs(prev => prev.slice(0, tabs.length));
  }, [tabs.length]);

  // Animate the indicator on first render
  useEffect(() => {
    if (
      selectedTabIndex !== undefined &&
      !isAnimated &&
      selectedRect &&
      navRect
    ) {
      setIsAnimated(true);
    }
  }, [selectedRect, navRect, selectedTabIndex, isAnimated]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <nav
      ref={navRef}
      className="relative z-0 flex shrink-0 items-center mb-1.5 mt-2 py-2 max-w-full overflow-x-auto overflow-y-visible"
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
      onPointerLeave={e => setHoveredTabIndex(null)}
    >
      {tabs.map((item, i) => {
        const isActive =
          hoveredTabIndex === i || selectedTabIndex === i || false;
        const href = firstSlug + item.href;

        return (
          <Link key={i} passHref legacyBehavior href={href}>
            <motion.a
              ref={el => (anchorRefs[i] = el)}
              className={cn(
                "relative z-20 flex h-10 cursor-pointer select-none items-center rounded-md bg-transparent mb-0.5 px-2.5 text-sm font-medium transition-colors hover:text-text-weak",
                !isActive ? "text-text-weak" : "text-text",
              )}
              onPointerEnter={() => {
                setHoveredTabIndex(i);
                router.prefetch(href);
              }}
              onFocus={() => {
                setHoveredTabIndex(i);
              }}
              onClick={() => {
                setSelectedTabIndex(i);
              }}
            >
              {<item.icon className="mr-2 h-4 w-4" />}
              {item.label}
              {item.number > 0 && (
                <Badge
                  type="number"
                  variant="outline"
                  className="font-sm ml-2 rounded-full bg-background-strong text-text-weak border-0"
                >
                  {item.number}
                </Badge>
              )}
            </motion.a>
          </Link>
        );
      })}
      <AnimatePresence>
        {hoveredRect && navRect && (
          <motion.div
            key={"hover"}
            className="absolute left-0 top-0 z-10 mb-1 rounded-md bg-background-stronger"
            initial={{
              x: hoveredRect.left - navRect.left,
              y: hoveredRect.top - navRect.top,
              width: hoveredRect.width,
              height: hoveredRect.height,
              opacity: 0,
            }}
            animate={{
              x: hoveredRect.left - navRect.left,
              y: hoveredRect.top - navRect.top,
              width: hoveredRect.width,
              height: hoveredRect.height,
              opacity: 1,
            }}
            exit={{
              x: hoveredRect.left - navRect.left,
              y: hoveredRect.top - navRect.top,
              width: hoveredRect.width,
              height: hoveredRect.height,
              opacity: 0,
            }}
            transition={transition}
          />
        )}
      </AnimatePresence>
      {selectedRect && navRect && isAnimated && (
        <motion.div
          className={
            "absolute bottom-0 left-0.5 z-10 h-[3px] rounded-lg bg-background-primary"
          }
          initial={false}
          animate={{
            width: selectedRect.width * 0.8,
            x: `calc(${selectedRect.left - navRect.left}px + 10%)`,
            opacity: 1,
          }}
          transition={transition}
        />
      )}
    </nav>
  );
};
