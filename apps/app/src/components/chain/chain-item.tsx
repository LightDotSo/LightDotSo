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

import { cn } from "@lightdotso/utils";
import { m } from "framer-motion";
import type { FC, MouseEventHandler } from "react";
import type { Address, Chain } from "viem";
import s from "@/components/chain/chain-item.module.css";
import { ChainLogo } from "@/svgs";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export type ChainItemProps = {
  address: Address;
  chain: Chain;
  className?: string;
  id: string;
  onMouseEnter?: MouseEventHandler<HTMLLIElement>;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const ChainItem: FC<ChainItemProps> = ({
  address,
  className,
  id,
  chain,
  onMouseEnter,
}) => {
  const { id: chainId, blockExplorers } = chain;

  const item = {
    visible: { opacity: 1, x: 0 },
    hidden: { opacity: 0, x: -10 },
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <m.li
      className={className}
      id={id}
      style={{
        listStyle: "none",
        marginRight: "-5px",
        padding: 0,
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
        className={cn("cursor-pointer overflow-hidden", s.transitionfix)}
        onClick={e => {
          return e.stopPropagation();
        }}
      >
        <ChainLogo chainId={chainId} className="h-8 w-8 rounded-lg bg-border" />
      </a>
    </m.li>
  );
};
