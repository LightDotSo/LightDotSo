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

// From: https://stackblitz.com/edit/vitejs-vite-x1cial?file=src%2Fuse-refinement.ts
// Ref: https://github.com/orgs/react-hook-form/discussions/9005
// Thank you to @lennerd for the original implementation!

import type { MutableRefObject } from "react";
import { useEffect, useRef } from "react";

// -----------------------------------------------------------------------------
// Hook Props
// -----------------------------------------------------------------------------

export interface Refinement<T> {
  /**
   * Refinement function signature
   */
  (data: T): boolean | Promise<boolean>;

  /**
   * Method to invalidate the refinement and allow re-performing
   */
  invalidate(): void;
}

export interface RefinementCallback<T> {
  (data: T, ctx: { signal: AbortSignal }): boolean | Promise<boolean>; // Callback function signature
}

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

/**
 * Special hook returning a callback to be used in conjunction with zod refinements.
 * When a zod schema is used within a form, it will run on every change, calling all refinements
 * regardless of whether the actual data used inside the refinement has changed or not.
 * This hook returns a special refinement function that will only run the callback once, and then
 * cache the result. The cache can be invalidated by calling the `invalidate` method on the returned
 * function (for example via an onChange prop). The callback receives a context variable as a second
 * argument containing an AbortSignal that can be used to cancel requests within the refinement.
 * Passing a `debounce` option to the hook will also debounce the callback.
 *
 * @param callback The refinement callback
 * @param options { debounce?: number } Options for debouncing the refinement (in milliseconds)
 * @returns A refinement function that can be used in zod schemas. Has an `invalidate` method to
 * invalidate the cache and allow re-performing the refinement.
 */

export function useRefinement<T>(
  callback: RefinementCallback<T>,
  { debounce }: { debounce?: number } = {},
): Refinement<T> {
  const ctxRef = useRef() as MutableRefObject<RefinementContext<T>>;
  const refinementRef = useRef() as MutableRefObject<{
    refine: Refinement<T>;
    abort(): void;
  }>;

  ctxRef.current = { callback: callback, debounce: debounce };

  if (refinementRef.current == null) {
    refinementRef.current = createRefinement(ctxRef);
  }

  // Cleanup effect to abort ongoing refinement when the component unmounts
  useEffect(() => () => refinementRef.current.abort(), []);

  return refinementRef.current.refine;
}

interface RefinementContext<T> {
  callback: RefinementCallback<T>;
  debounce?: number;
}

function createRefinement<T>(ctxRef: MutableRefObject<RefinementContext<T>>) {
  let abortController: AbortController | null = null;
  let result: Promise<boolean> | null = null;
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const start = async (data: T) => {
    abortController = new AbortController();

    if (ctxRef.current.debounce != null) {
      await new Promise((resolve) => {
        // Wait for the debounce duration
        timeout = setTimeout(resolve, ctxRef.current.debounce);
      });
    }

    const result = await ctxRef.current.callback(data, {
      // Pass the AbortController's signal to the callback
      signal: abortController.signal,
    });

    // Reset the AbortController
    abortController = null;

    return result;
  };

  const refine = async (data: T) => {
    // Refinement is cached. Return previous result.
    if (result != null) {
      return result;
    }

    return (result = start(data));
  };

  const abort = () => {
    // Clear debounce timeout
    if (timeout != null) {
      clearTimeout(timeout);
    }

    timeout = null;
    abortController?.abort();
    abortController = null;
  };

  refine.invalidate = () => {
    // Cancel any ongoing refinement
    abort();
    // Reset the result
    result = null;
  };

  return { refine: refine, abort: abort };
}
