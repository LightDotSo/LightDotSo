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

import { createPopper } from "@popperjs/core";
import { useRef, useEffect, useCallback, useState } from "react";

export const usePositioner = () => {
  const popperJSRef = useRef(null);
  const [position, setPosition] = useState(null);

  useEffect(() => {
    if (popperJSRef.current) {
      popperJSRef.current.destroy();
      popperJSRef.current = null;
    }
  }, []);

  const updateTarget = useCallback(targetEl => {
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
    }) => {
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
          fn: ({ state }) => {
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

      popperJSRef.current = createPopper(targetEl, popoverRef.current, {
        placement,
        //@ts-ignore
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
