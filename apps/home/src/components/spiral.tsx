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

import { cn } from "@lightdotso/utils";
import { type FC, useEffect, useState } from "react";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const Spiral: FC = () => {
  // ---------------------------------------------------------------------------
  // State Hooks
  // ---------------------------------------------------------------------------

  const [applyOpacity, setApplyOpacity] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const handleScroll = () => {
      const shouldBeOpaque = window.scrollY > 0;
      setApplyOpacity(shouldBeOpaque);
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      className={cn(
        "-top-[15rem] md:-top-[20rem] lg:-top-[40rem] xl:-top-[48rem] 2xl:-top-[64rem] fixed inset-x-0 z-0 block animate-slow-spin overflow-hidden transition-opacity duration-300",
        applyOpacity ? "opacity-60" : "opacity-80",
      )}
      style={{
        transform: `translateY(${-scrollY / 1.5}px)`,
      }}
    >
      <img
        className="pointer-events-none size-full animate-spin-slow select-none rounded-full object-cover"
        src={
          process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
            ? "/home/spiral.svg"
            : "/spiral.svg"
        }
        alt="Spiral"
      />
    </div>
  );
};
