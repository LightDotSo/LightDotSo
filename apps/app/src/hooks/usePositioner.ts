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

import type { MutableRefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Instance } from "@popperjs/core";
import { createPopper } from "@popperjs/core";

interface PositionPopoverConfig {
  popoverRef: MutableRefObject<HTMLElement | null>;
  targetEl: HTMLElement;
  placement?: string;
  offset?: [number, number];
  applyStyles?: (state: any) => void;
  gpuAcceleration?: boolean;
}

export const usePositioner = () => {
  const popperJSRef: MutableRefObject<Instance | null> =
    useRef<Instance | null>(null);
  const [position, setPosition] = useState<string | null>(null);

  useEffect(() => {
    if (popperJSRef.current) {
      popperJSRef.current.destroy();
      popperJSRef.current = null;
    }
  }, []);

  const updateTarget = useCallback((targetEl: HTMLElement) => {
    if (popperJSRef.current) {
      popperJSRef.current.state.elements.reference = targetEl;
      popperJSRef.current.update();
    }
  }, []);

  const positionPopover = useCallback(
    ({
      popoverRef,
      targetEl,
      placement = "bottom",
      offset,
      applyStyles,
      gpuAcceleration = true,
    }: PositionPopoverConfig) => {
      if (popperJSRef.current) {
        popperJSRef.current.destroy();
        popperJSRef.current = null;
      }

      const modifiers = [
        {
          name: "offset",
          options: { offset },
        },
        {
          name: "eventListeners",
          options: {
            resize: true,
            scroll: false,
          },
        },
        {
          name: "computeStyles",
          options: {
            gpuAcceleration,
          },
        },
        {
          name: "preventOverflow",
          options: {
            padding: 8,
          },
        },
        {
          name: "arrow",
        },
        {
          name: "updateState",
          enabled: true,
          phase: "write",
          fn: ({ state }: { state: any }) => {
            setPosition(state.placement);
          },
          requires: ["computeStyles"],
        },
      ];

      if (applyStyles) {
        modifiers.push({
          name: "applyStyles",
          enabled: true,
          requires: [],
          phase: "write",
          fn: ({ state }) => {
            applyStyles({ ...state });
          },
        });
      }

      if (!popoverRef.current) {
        return;
      }

      popperJSRef.current = createPopper(targetEl, popoverRef.current, {
        // @ts-ignore
        placement,
        // @ts-ignore
        modifiers,
      });
    },
    [],
  );

  return {
    popperJSRef,
    positionPopover,
    placement: position,
    updateTarget,
  };
};
