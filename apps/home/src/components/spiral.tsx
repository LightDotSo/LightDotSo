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

import { cn } from "@lightdotso/utils";
import { useEffect, useState, type FC } from "react";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const Spiral: FC = () => {
  // ---------------------------------------------------------------------------
  // State Hooks
  // ---------------------------------------------------------------------------

  const [applyOpacity, setApplyOpacity] = useState(false);

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const handleScroll = () => {
      const shouldBeOpaque = window.scrollY > 0;
      setApplyOpacity(shouldBeOpaque);
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
        "fixed inset-x-0 md:-top-[20rem] lg:-top-[40rem] xl:-top-[48rem] 2xl:-top-[64rem] z-0 block overflow-hidden transition-opacity duration-300 animate-slow-spin",
        applyOpacity ? "opacity-70" : "opacity-100",
      )}
    >
      <img
        className="size-full animate-spin-slow object-cover select-none pointer-events-none"
        src="/spiral.svg"
        alt="Spiral"
      />
    </div>
  );
};
