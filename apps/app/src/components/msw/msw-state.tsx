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

import type { SetupWorker } from "msw/lib/browser";
import { useEffect, useState } from "react";
import { usePathType } from "@/hooks";

export const MSWState = () => {
  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const type = usePathType();

  // ---------------------------------------------------------------------------
  // State Hooks
  // ---------------------------------------------------------------------------

  const [worker, setWorker] = useState<SetupWorker>();

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const doMswInit = async () => {
      if (type === "demo") {
        if (typeof window !== "undefined") {
          if (!worker) {
            const { worker } = await import("@lightdotso/msw");
            worker.start();
            setWorker(worker);
          }
        }
      } else {
        if (worker) {
          worker.stop();
          setWorker(undefined);
        }
      }
    };
    doMswInit();

    return () => {
      if (worker) {
        worker.stop();
      }
    };
  }, [type, worker]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return null;
};
