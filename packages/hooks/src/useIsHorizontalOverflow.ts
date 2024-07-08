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

import { type RefObject, useLayoutEffect, useState } from "react";

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useIsHorizontalOverflow = (
  ref: RefObject<HTMLElement>,
): boolean => {
  // ---------------------------------------------------------------------------
  // State Hooks
  // ---------------------------------------------------------------------------

  const [isOverflow, setIsOverflow] = useState(false);

  // ---------------------------------------------------------------------------
  // Layout Effect Hooks
  // ---------------------------------------------------------------------------

  useLayoutEffect(() => {
    const { current } = ref;

    const trigger = () => {
      if (!current) {
        return;
      }

      const hasOverflow = current?.scrollWidth > current?.clientWidth || false;

      setIsOverflow(hasOverflow);
    };

    if (current) {
      trigger();
    }
  }, [ref]);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return isOverflow;
};
