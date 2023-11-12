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

// From: OG Light https://github.com/LightDotSo/LightDotSo/blob/026cc175225642102c708bd7c7f5d76dc222d62c/apps/app/src/components/NetworkTooltip/NetworkTooltip.tsx

import clsx from "clsx";
import { motion } from "framer-motion";
import type { FC, ReactNode } from "react";
import { useState, useRef, useEffect, useCallback, useMemo, memo } from "react";

import { usePositioner } from "@/hooks/usePositioner";

const EASING = [0.4, 0, 0, 1];
const DEFAULT_POSITIONS = { popper: null };

export type NetworkToolTipComponentProps = {
  id?: string;
  target: any;
  activeId: any;
  children: ReactNode;
};

const NetworkTooltipComponent: FC<NetworkToolTipComponentProps> = ({
  id = 0,
  target,
  activeId,
  children,
}) => {
  const { popperJSRef, positionPopover, updateTarget } = usePositioner();
  const [{ popper }, setStyles] = useState(DEFAULT_POSITIONS);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const isMountedRef = useRef(false);

  useEffect(() => {
    if (!target) {
      return;
    }

    if (popperJSRef.current) {
      updateTarget(target);
      return;
    }

    positionPopover({
      popoverRef,
      targetEl: target,
      offset: [0, 8],
      gpuAcceleration: false,
      applyStyles: (state: { styles: { popper: any } }) => {
        setStyles({
          popper: state.styles.popper,
        });
      },
    });
  }, [target, popperJSRef, updateTarget, positionPopover]);

  const onAnimationComplete = useCallback(() => {
    isMountedRef.current = !!activeId;
  }, [activeId]);

  const isShowing = activeId && popper;

  return useMemo(() => {
    const isMounted = isMountedRef.current;

    return (
      <motion.div
        className={clsx(
          "absolute z-10 shadow-md",
          isShowing ? "pointer-events-auto" : "pointer-events-none",
        )}
        transition={{ duration: 0.3, ease: EASING }}
        initial={{ opacity: 0 }}
        animate={{ opacity: isShowing ? 1 : 0 }}
        onAnimationComplete={onAnimationComplete}
      >
        <motion.div
          ref={popoverRef}
          className="absolute inline-block rounded-md bg-contrast-higher px-3 py-1 text-left text-sm font-semibold text-contrast-lower shadow-md"
          layoutId={`NetworkTooltip-${id}`}
          transition={!isMounted ? { duration: 0 } : { duration: 0.3 }}
          style={{
            ...(popper || {}),
          }}
        >
          <motion.div>{children}</motion.div>
        </motion.div>
      </motion.div>
    );
  }, [isShowing, onAnimationComplete, popper, children, id]);
};

export const NetworkTooltip = memo(NetworkTooltipComponent);
