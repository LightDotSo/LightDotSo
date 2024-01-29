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

import { useModalSwiper } from "@lightdotso/stores";
import { motion } from "framer-motion";
import type { FC, ReactNode } from "react";

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
  // Stores
  // ---------------------------------------------------------------------------

  const { pageIndex } = useModalSwiper();

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  // Check if pageIndex is within array boundaries
  if (pageIndex < 0 || pageIndex >= children.length) {
    return null;
  }

  return (
    <motion.div
      key={pageIndex}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.3 },
      }}
    >
      {children[pageIndex]}
    </motion.div>
  );
};
