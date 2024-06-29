// Copyright 2023-2024 Light
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

import { useModalSwiper } from "@lightdotso/stores";
import { motion } from "framer-motion";
import { useState, type FC, type ReactNode, useEffect } from "react";

// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

const variants = {
  enter: { x: "30%", opacity: 0 },
  center: { x: "0", opacity: 1 },
  exit: { x: "-30%", opacity: 0 },
};

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface ModalSwiperProps {
  children: ReactNode[];
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const ModalSwiper: FC<ModalSwiperProps> = ({ children }) => {
  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const [hasAnimated, setHasAnimated] = useState(false);

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { pageIndex } = useModalSwiper();

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (pageIndex === 0) {
      setHasAnimated(true);
    }
  }, [pageIndex, setHasAnimated]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <motion.div
      key={pageIndex}
      className="relative w-full"
      variants={variants}
      initial={!hasAnimated ? "center" : "enter"}
      animate="center"
      exit="exit"
      transition={{
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.3 },
      }}
    >
      {children}
    </motion.div>
  );
};
