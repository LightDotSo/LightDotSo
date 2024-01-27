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
