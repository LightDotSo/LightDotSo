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
import type { FC, MouseEventHandler } from "react";
import s from "./network-item.module.css";
import type { Address, Chain } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export type NetworkItemProps = {
  address: Address;
  className?: string;
  id: string;
  onMouseEnter?: MouseEventHandler<HTMLLIElement>;
  network: Chain;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const NetworkItem: FC<NetworkItemProps> = ({
  address,
  className,
  id,
  network,
  onMouseEnter,
}) => {
  const { id: networkId, network: name, blockExplorers } = network;

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
      <a
        target="_blank"
        rel="noreferrer"
        href={`${blockExplorers?.default.url}/address/${address}`}
        className={clsx(
          "bg-card hover:bg-muted flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-border-primary-weak",
          s.transitionfix,
        )}
        onClick={e => {
          return e.stopPropagation();
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={networkId.toString()}
          src={`https://icons.llamao.fi/icons/chains/rsz_${
            name === "homestead"
              ? "ethereum"
              : name === "matic"
                ? "polygon"
                : name
          }.jpg`}
        ></img>
      </a>
    </m.li>
  );
};
