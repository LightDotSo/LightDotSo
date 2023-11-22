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
import { LazyMotion, domAnimation, m } from "framer-motion";
import { useReducer, useCallback } from "react";
import type { FC } from "react";
import type { Address, Chain } from "viem";
import {
  arbitrum,
  polygon,
  optimism,
  mainnet,
  base,
  avalanche,
  gnosis,
} from "wagmi/chains";
import { NetworkItem } from "@/components/network/network-item";
import { NetworkItemExtra } from "@/components/network/network-item-extra";
import type { NetworkToolTipComponentProps } from "@/components/network/network-tooltip";
import { NetworkTooltip } from "@/components/network/network-tooltip";

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

export type NetworkStackProps = Pick<NetworkToolTipComponentProps, "id"> & {
  address: Address;
  disableLoading?: boolean;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const NetworkStack: FC<NetworkStackProps> = ({ address, id }) => {
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

  const networks: Chain[] = [
    mainnet,
    arbitrum,
    polygon,
    optimism,
    base,
    avalanche,
    gnosis,
  ];

  const NETWORK_STACK_NUMBER = 6;

  return (
    <div
      className={clsx("flex flex-row rounded-full bg-bg-dark")}
      onMouseLeave={hide}
    >
      <LazyMotion features={domAnimation}>
        <NetworkTooltip id={address} activeId={activeId} target={target}>
          {networks && activeId === networks?.length.toString()
            ? "See More"
            : (networks && networks[activeId]?.name) ??
              (networks && networks[activeId]?.id) ??
              ""}
        </NetworkTooltip>
        <m.ul className="flex shrink justify-end">
          {!networks?.length && <div className="h-14 bg-inherit" />}
          {networks &&
            typeof networks[0] !== "undefined" &&
            networks?.slice(0, NETWORK_STACK_NUMBER).map((network, id) => {
              return (
                <NetworkItem
                  key={id}
                  id={id.toString()}
                  address={address}
                  network={network}
                  onMouseEnter={select}
                />
              );
            })}
          {networks?.length > NETWORK_STACK_NUMBER && (
            <NetworkItemExtra
              key={id}
              id={String(networks?.length)}
              length={
                networks?.length > NETWORK_STACK_NUMBER
                  ? networks?.length - NETWORK_STACK_NUMBER
                  : networks?.length
              }
              onMouseEnter={select}
            />
          )}
        </m.ul>
      </LazyMotion>
    </div>
  );
};
