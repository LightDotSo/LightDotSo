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

"use client";

import { ChainLogo } from "@lightdotso/svg";
import { cn } from "@lightdotso/utils";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface FloatingIconProps {
  className: string;
  chainId: number;
  chainName: string;
  scrollFactor?: number;
  rotationFactor?: number;
  primaryColor?: string;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const FloatingIcon = ({
  className,
  chainId,
  // chainName,
  scrollFactor = 0.8,
  rotationFactor = 6,
}: FloatingIconProps) => {
  // ---------------------------------------------------------------------------
  // Refs
  // ---------------------------------------------------------------------------

  const ref = useRef(null);

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // ---------------------------------------------------------------------------
  // Const
  // ---------------------------------------------------------------------------

  // Choose a random size out of `4xl` to `6xl`
  const size = ["4xl", "4xl", "4xl", "5xl", "5xl", "6xl"][
    Math.floor(
      Math.random() * ["4xl", "4xl", "4xl", "5xl", "5xl", "6xl"].length,
    )
  ];

  const yRange = Math.random() * 100 + 50;
  const y = useTransform(scrollYProgress, [0, 1], [0, yRange * scrollFactor]);

  const rotationRange = Math.random() * 30 - 15;
  const rotate = useTransform(
    scrollYProgress,
    [0, 1],
    [0, rotationRange * rotationFactor],
  );

  // ---------------------------------------------------------------------------
  // Animations
  // ---------------------------------------------------------------------------

  const hoverAnimation = {
    scale: 1.2,
    rotate: 15,
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <motion.div
      ref={ref}
      className={cn("absolute", className)}
      style={{ y, rotate }}
      whileHover={hoverAnimation}
    >
      <ChainLogo size={size as "4xl" | "5xl" | "6xl"} chainId={chainId} />
    </motion.div>
  );
};
