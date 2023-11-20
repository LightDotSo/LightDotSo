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

import clsx from "clsx";
import type { FC, InsHTMLAttributes } from "react";
import s from "@/components/placeholder-orb.module.css";

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
  const color = colors[address[41]?.charCodeAt(0) % colors.length];

  return (
    <span
      className={clsx(
        "aspect-square inline-block h-full w-full overflow-hidden rounded-full",
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
