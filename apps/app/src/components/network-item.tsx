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
import { m } from "framer-motion";
import Link from "next/link";
import type { FC, MouseEventHandler } from "react";
import s from "./network-item.module.css";
import type { Chain } from "viem";

export type NetworkItemProps = {
  className?: string;
  id: string;
  onMouseEnter?: MouseEventHandler<HTMLLIElement>;
  network: Chain;
};

export const NetworkItem: FC<NetworkItemProps> = ({
  className,
  id,
  network,
  onMouseEnter,
}) => {
  const { id: networkId, name } = network;

  const item = {
    visible: { opacity: 1, x: 0 },
    hidden: { opacity: 0, x: -10 },
  };

  return (
    <m.li
      className={className}
      id={id}
      style={{
        listStyle: "none",
        marginRight: "-5px",
      }}
      variants={item}
      whileHover={{
        scale: 1.2,
        marginRight: "5px",
        transition: { ease: "easeOut" },
      }}
      onMouseEnter={onMouseEnter}
    >
      <Link
        passHref
        href={`/${networkId}`}
        className={clsx(
          "flex h-12 w-12 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-bg-darker bg-bg-lighter text-3xl hover:bg-contrast-lower",
          s.transitionfix,
        )}
        onClick={e => {
          return e.stopPropagation();
        }}
      >
        <span className="text-sm font-semibold leading-none text-contrast-low">
          {name}
        </span>
      </Link>
    </m.li>
  );
};
