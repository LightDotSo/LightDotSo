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

import { cn } from "@lightdotso/utils";
import type { FC, InsHTMLAttributes } from "react";
// @ts-ignore
import s from "./placeholder-orb.module.css";

// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

const colors = [
  "gray",
  "red",
  "orange",
  "yellow",
  "green",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "purple",
  "pink",
  "rose",
];

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export type PlaceholderOrbProps = {
  address: string;
} & InsHTMLAttributes<HTMLSpanElement>;

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const PlaceholderOrb: FC<PlaceholderOrbProps> = ({
  address,
  className,
}) => {
  // ---------------------------------------------------------------------------
  // Local Variables
  // ---------------------------------------------------------------------------

  const color = colors[address[41]?.charCodeAt(0) % colors.length];

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <span
      className={cn(
        "inline-block aspect-square size-full overflow-hidden rounded-full",
        color === "gray" && s.gray,
        color === "red" && s.red,
        color === "orange" && s.orange,
        color === "yellow" && s.yellow,
        color === "green" && s.green,
        color === "teal" && s.teal,
        color === "cyan" && s.cyan,
        color === "sky" && s.sky,
        color === "blue" && s.blue,
        color === "indigo" && s.indigo,
        color === "purple" && s.purple,
        color === "pink" && s.pink,
        color === "rose" && s.rose,
        className,
      )}
    />
  );
};
