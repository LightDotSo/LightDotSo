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

import { cn } from "@lightdotso/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, useSpring, useTransform } from "framer-motion";
import type { HTMLMotionProps, MotionValue } from "framer-motion";
import { forwardRef, useEffect, useState } from "react";

const numberVariantsWhole = cva("text-text", {
  variants: {
    size: {
      xl: "text-xl",
      lg: "text-lg",
      base: "text-base",
    },
  },
  defaultVariants: {
    size: "base",
  },
});

const numberVariantsFraction = cva("text-sm text-text-weak", {
  variants: {
    size: {
      xl: "text-base",
      lg: "text-sm",
      base: "text-xs",
    },
  },
  defaultVariants: {
    size: "base",
  },
});

// Update NumberProps to include VariantProps for both the whole and fraction number variants
interface NumberProps
  extends HTMLMotionProps<"span">,
    VariantProps<typeof numberVariantsWhole>,
    VariantProps<typeof numberVariantsFraction> {
  prefix?: string;
  value: number;
}

const NumberValue: React.FC<{ display: MotionValue<string> }> = ({
  // eslint-disable-next-line react/prop-types
  display,
}) => {
  // eslint-disable-next-line react/prop-types
  const [value, setValue] = useState(() => display.get().toString());

  useEffect(() => {
    // eslint-disable-next-line react/prop-types
    const unsubscribe = display.on("change", v => {
      setValue(v.toString());
    });

    return () => {
      unsubscribe();
    };
  }, [display]);

  return <>{value}</>;
};

const Number = forwardRef<HTMLSpanElement, NumberProps>(
  ({ prefix, value, className, size, ...props }, ref) => {
    let spring = useSpring(value, { mass: 0.8, stiffness: 80, damping: 10 });

    let displayWhole = useTransform(spring, current =>
      Math.floor(current).toLocaleString(),
    );

    let displayFraction = useTransform(spring, current =>
      current % 1 > 0 ? (current % 1).toFixed(2).substring(2) : "00",
    );

    useEffect(() => {
      spring.set(value);
    }, [spring, value]);

    return (
      <motion.span
        ref={ref}
        className={cn(numberVariantsWhole({ size, className }))}
        {...props}
      >
        <span>{prefix && prefix}</span>
        <NumberValue display={displayWhole} />.
        <span className={cn(numberVariantsFraction({ size }))}>
          <NumberValue display={displayFraction} />
        </span>
      </motion.span>
    );
  },
);

Number.displayName = "Number";

export { Number };
