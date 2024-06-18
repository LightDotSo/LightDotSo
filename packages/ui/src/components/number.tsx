// Copyright 2023-2024 Light, Inc.
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

import { cn } from "@lightdotso/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, useSpring, useTransform } from "framer-motion";
import type { HTMLMotionProps, MotionValue } from "framer-motion";
import { forwardRef, useEffect, useState } from "react";

// -----------------------------------------------------------------------------
// Styles
// -----------------------------------------------------------------------------

const numberVariantsWhole = cva("text-text", {
  variants: {
    variant: {
      default: "font-bold",
      neutral: "font-normal",
    },
    size: {
      xl: "text-xl font-bold md:text-2xl lg:text-3xl",
      lg: "text-lg",
      base: "text-base",
      balance: "text-lg font-medium",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "base",
  },
});

const numberVariantsFraction = cva("text-sm", {
  variants: {
    variant: {
      default: "text-text-weak",
      neutral: "text-text",
    },
    size: {
      xl: "text-lg md:text-xl",
      lg: "text-sm",
      base: "text-xs",
      balance: "text-xs font-medium md:text-base",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "base",
  },
});

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface NumberProps
  extends HTMLMotionProps<"span">,
    VariantProps<typeof numberVariantsWhole>,
    VariantProps<typeof numberVariantsFraction> {
  prefix?: string;
  value: number;
}

// -----------------------------------------------------------------------------
// Components
// -----------------------------------------------------------------------------

const NumberValue = ({
  display,
}: {
  display: MotionValue<string>;
}): JSX.Element => {
  const [value, setValue] = useState(() => display.get().toString());

  useEffect(() => {
    const unsubscribe = display.on("change", v => {
      setValue(v.toString());
    });

    return () => {
      unsubscribe();
    };
  }, [display]);

  // eslint-disable-nextline react/jsx-no-useless-fragment
  return <>{value}</>;
};

const Number = forwardRef<HTMLSpanElement, NumberProps>(
  ({ prefix, value, className, size, variant, ...props }, ref) => {
    let spring = useSpring(0, {
      mass: 0.8,
      stiffness: 80,
      damping: 10,
    });

    let displayWhole = useTransform(spring, current => {
      if (current === undefined || current === null || isNaN(current)) {
        return "0";
      }
      return Math.max(0, Math.floor(current)).toLocaleString();
    });

    let displayFraction = useTransform(spring, current =>
      current % 1 > 0 ? (current % 1).toFixed(2).substring(2) : "00",
    );

    useEffect(() => {
      // Delay the spring animation to give the component time to mount
      setTimeout(() => {
        spring.set(parseFloat(value.toFixed(2)));
      }, 300);
    }, [spring, value]);

    return (
      <motion.span
        ref={ref}
        className={cn(numberVariantsWhole({ size, variant, className }))}
        {...props}
      >
        {prefix && prefix}
        <NumberValue display={displayWhole} />
        <span className={cn(numberVariantsFraction({ size, variant }))}>
          .
          <NumberValue display={displayFraction} />
        </span>
      </motion.span>
    );
  },
);

Number.displayName = "Number";

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

export { Number };
