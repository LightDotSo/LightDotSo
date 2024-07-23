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

import { debounce } from "lodash";
import { useEffect, useRef, useState } from "react";

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export function useDebouncedValue<T>(value: T, delay: number): [T, boolean] {
  // ---------------------------------------------------------------------------
  // State Hooks
  // ---------------------------------------------------------------------------

  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isDebouncing, setIsDebouncing] = useState<boolean>(false);
  const valueRef = useRef<T>(value);

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    // Check if the current value is different from the last debounced value
    if (valueRef.current !== value) {
      setIsDebouncing(true);
      const handler = debounce(() => {
        setDebouncedValue(value);
        setIsDebouncing(false);
        valueRef.current = value;
      }, delay);
      handler();
      return () => {
        handler.cancel();
        setIsDebouncing(false);
      };
    }
  }, [value, delay]);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return [debouncedValue, isDebouncing];
}
