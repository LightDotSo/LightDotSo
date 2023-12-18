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

import { LazyMotion, domAnimation, m } from "framer-motion";
import { useReducer, useCallback } from "react";
import type { FC } from "react";
import type { Address, Chain } from "viem";
import { ChainItem } from "@/components/chain/chain-item";
import { ChainItemExtra } from "@/components/chain/chain-item-extra";
import type { ChainItemToolTipComponentProps } from "@/components/chain/chain-item-tooltip";
import { ChainItemTooltip } from "@/components/chain/chain-item-tooltip";

// -----------------------------------------------------------------------------
// Logic
// -----------------------------------------------------------------------------

const reducer = (state: any, action: any) => {
  switch (action.type) {
    case "show":
      return {
        ...state,
        activeId: action.payload.target.id,
        target: action.payload.target,
      };
    case "hide":
      return {
        ...state,
        activeId: null,
      };
    default:
      return state;
  }
};

const defaultState = { activeId: null, target: null, text: "" };

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export type ChainStackProps = Pick<ChainItemToolTipComponentProps, "id"> & {
  className?: string;
  address: Address;
  chains: Chain[];
  disableLoading?: boolean;
  onClick?: () => void;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const ChainStack: FC<ChainStackProps> = ({
  className,
  address,
  chains,
  id,
  onClick,
}) => {
  const [{ activeId, target }, dispatch] = useReducer(reducer, defaultState);

  const select = useCallback((e: any) => {
    dispatch({
      type: "show",
      payload: { target: e.currentTarget },
    });
  }, []);

  const hide = useCallback((e: any) => {
    dispatch({
      type: "hide",
      payload: { target: e.currentTarget },
    });
  }, []);

  const CHAIN_STACK_NUMBER = 3;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className={className} onMouseLeave={hide}>
      <LazyMotion features={domAnimation}>
        <ChainItemTooltip id={address} activeId={activeId} target={target}>
          {chains && activeId === chains?.length.toString()
            ? "See More"
            : (chains && chains[activeId]?.name) ??
              (chains && chains[activeId]?.id) ??
              ""}
        </ChainItemTooltip>
        <m.ul className="flex shrink items-center justify-end">
          {!chains?.length && <div className="h-14" />}
          {chains &&
            typeof chains[0] !== "undefined" &&
            chains?.slice(0, CHAIN_STACK_NUMBER).map((chain, id) => {
              return (
                <ChainItem
                  key={id}
                  className="z-[2]"
                  id={id.toString()}
                  address={address}
                  chain={chain}
                  onMouseEnter={select}
                />
              );
            })}
          {chains?.length > CHAIN_STACK_NUMBER && (
            <ChainItemExtra
              key={id}
              className="z-[3]"
              id={String(chains?.length)}
              length={
                chains?.length > CHAIN_STACK_NUMBER
                  ? chains?.length - CHAIN_STACK_NUMBER
                  : chains?.length
              }
              onClick={onClick}
            />
          )}
        </m.ul>
      </LazyMotion>
    </div>
  );
};
