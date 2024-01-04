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

import type { SetupWorker } from "msw/lib/browser";
import { useEffect, useState } from "react";
import { usePathType } from "@/hooks/usePathType";

export const MSWState = () => {
  // ---------------------------------------------------------------------------
  // State Hooks
  // ---------------------------------------------------------------------------

  const type = usePathType();
  const [worker, setWorker] = useState<SetupWorker>();

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const doMswInit = async () => {
      if (type === "demo") {
        if (typeof window !== "undefined") {
          if (!worker) {
            const { worker } = await import("@/msw/browser");
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
