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

import React, { useEffect, useMemo, useRef, useState } from "react";

import type { Tab } from "@/hooks/useTabs";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { isAddress } from "viem";
import type { FC } from "react";

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

type TabProps = {
  setSelectedTabIndex: (_index: number) => void;
  selectedTabIndex: number | undefined;
  tabs: Tab[];
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const Tabs: FC<TabProps> = ({
  tabs,
  selectedTabIndex,
  setSelectedTabIndex,
}) => {
  const [anchorRefs, setAnchorRefs] = useState<Array<HTMLAnchorElement | null>>(
    [],
  );

  useEffect(() => {
    setAnchorRefs(prev => prev.slice(0, tabs.length));
  }, [tabs.length]);

  const router = useRouter();
  const pathname = usePathname();

  const firstSlug = useMemo(() => {
    // Split the path using '/' as delimiter and remove empty strings
    const slugs = pathname.split("/").filter(slug => slug);

    // Return the first slug if it is an address
    return slugs.length > 0 && isAddress(slugs[0]) ? "/" + slugs[0] : "";
  }, [pathname]);

  const navRef = useRef<HTMLDivElement>(null);
  const navRect = navRef.current?.getBoundingClientRect();

  const selectedRect =
    selectedTabIndex !== undefined
      ? anchorRefs[selectedTabIndex]?.getBoundingClientRect()
      : undefined;

  const [hoveredTabIndex, setHoveredTabIndex] = useState<number | null>(null);
  const hoveredRect =
    anchorRefs[hoveredTabIndex ?? -1]?.getBoundingClientRect();

  return (
    <nav
      ref={navRef}
      className="relative z-0 mb-1.5 mt-2 flex shrink-0 items-center justify-center lg:my-0 lg:py-2"
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
      onPointerLeave={e => setHoveredTabIndex(null)}
    >
      {tabs.map((item, i) => {
        const isActive =
          hoveredTabIndex === i || selectedTabIndex === i || false;
        const href = firstSlug + item.href;

        return (
          <Link key={i} href={href} passHref legacyBehavior>
            <motion.a
              className={clsx(
                "hover:text-accent-foreground relative z-20 mb-0.5 flex h-10 cursor-pointer select-none items-center rounded-md bg-transparent px-2.5 text-sm font-medium transition-colors",
                !isActive ? "text-muted-foreground" : "text-primary",
              )}
              ref={el => (anchorRefs[i] = el)}
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
                <span className="font-sm ml-2 rounded-full bg-background-stronger px-2 py-0.5">
                  {item.number}
                </span>
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

      {selectedRect && navRect && (
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
