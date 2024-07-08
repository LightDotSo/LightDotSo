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

import { useState, useEffect } from "react";

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export function useDebounced(value: boolean, delay: number): boolean {
  // ---------------------------------------------------------------------------
  // State Hooks
  // ---------------------------------------------------------------------------

  const [debouncedValue, setDebouncedValue] = useState(value);

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    let handler: NodeJS.Timeout;

    if (debouncedValue === true && value === false) {
      handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
    } else {
      setDebouncedValue(value);
    }
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay, debouncedValue]);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return debouncedValue;
}
