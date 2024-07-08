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

import type { MotionValue } from "framer-motion";
import { animate, useMotionValue } from "framer-motion";
import { useEffect } from "react";

// Whole file from: https://codesandbox.io/p/sandbox/framer-motion-5-drag-to-reorder-lists-with-drag-handle-j9enw?file=%2Fsrc%2Fuse-raised-shadow.ts%3A23%2C1-24%2C1
// License: MIT

const inactiveShadow = "0px 0px 0px hsl(0,0,0,0.1)";

export function useRaisedShadow(value: MotionValue<number>) {
  const boxShadow = useMotionValue(inactiveShadow);

  useEffect(() => {
    let isActive = false;
    value.on("change", latest => {
      const wasActive = isActive;
      if (latest !== 0) {
        isActive = true;
        if (isActive !== wasActive) {
          animate(boxShadow, "3px 3px 3px hsl(0,0,0,0.11)");
        }
      } else {
        isActive = false;
        if (isActive !== wasActive) {
          animate(boxShadow, inactiveShadow);
        }
      }
    });
  }, [value, boxShadow]);

  return boxShadow;
}
