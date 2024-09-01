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
import { motion } from "framer-motion";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface FloatingIconProps {
  className: string;
  chainId: number;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const FloatingIcon = ({ className, chainId }: FloatingIconProps) => {
  // ---------------------------------------------------------------------------
  // Const
  // ---------------------------------------------------------------------------

  // Choose a random size out of `4xl` to `6xl`
  const size = ["4xl", "4xl", "4xl", "5xl", "5xl", "6xl"][
    Math.floor(
      Math.random() * ["4xl", "4xl", "4xl", "5xl", "5xl", "6xl"].length,
    )
  ];

  const offset = Math.random() * 20 - 10;
  const delay = Math.random() * 2;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <motion.div
      className={cn("absolute", className)}
      initial={{
        opacity: 0.3,
        filter: "blur(6px)",
        rotate: Math.random() * 10 - 5,
      }}
      animate={{
        y: [offset, offset - 10, offset],
      }}
      transition={{
        y: {
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
          ease: "easeInOut",
          delay: delay,
        },
      }}
      whileHover={{
        scale: 1.2,
        opacity: 1,
        filter: "blur(0px)",
        rotate: Math.random() * 10 - 5,
        transition: { duration: 0.3 },
      }}
    >
      <ChainLogo size={size as "4xl" | "5xl" | "6xl"} chainId={chainId} />
    </motion.div>
  );
};
