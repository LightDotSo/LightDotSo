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

import type {
  FC,
  ForwardRefExoticComponent,
  PropsWithoutRef,
  RefAttributes,
  SVGProps,
} from "react";
import { ArbitrumLogo } from "./arbitrum";
import { AvalancheLogo } from "./avalanche";
import { BaseLogo } from "./base";
import { BscLogo } from "./bsc";
import { EthereumLogo } from "./ethereum";
import { OptimismLogo } from "./optimism";
import { PolygonLogo } from "./polygon";
import { getChainById, shortenName } from "@/utils";

// -----------------------------------------------------------------------------
// Wrapper
// -----------------------------------------------------------------------------

interface TestnetChainLogoWrapperProps extends SVGProps<SVGSVGElement> {
  logo: ForwardRefExoticComponent<
    PropsWithoutRef<SVGProps<SVGSVGElement>> & RefAttributes<SVGSVGElement>
  >;
  chainId: number;
}

export const TestnetChainLogoWrapper: FC<TestnetChainLogoWrapperProps> = ({
  logo: Logo,
  chainId,
  ref: _,
  ...props
}) => (
  <div className="relative inline-block">
    <Logo {...props} />
    <span className="absolute bottom-0 right-2 inline-flex h-2 w-2 items-center justify-center rounded-full border border-border-primary-weak bg-background-stronger p-1 text-[6px]">
      {shortenName(getChainById(chainId).name)}
    </span>
  </div>
);

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface ChainLogoProps extends SVGProps<SVGSVGElement> {
  chainId: number;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const ChainLogo: FC<ChainLogoProps> = ({
  chainId,
  ref: _,
  ...props
}) => {
  switch (chainId) {
    // -------------------------------------------------------------------------
    // Mainnet
    // -------------------------------------------------------------------------
    case 1:
      return <EthereumLogo {...props} />;
    case 56:
      return <BscLogo {...props} />;
    case 137:
      return <PolygonLogo {...props} />;
    case 43114:
      return <AvalancheLogo {...props} />;
    case 42161:
      return <ArbitrumLogo {...props} />;
    case 10:
      return <OptimismLogo {...props} />;
    // -------------------------------------------------------------------------
    // Testnet
    // -------------------------------------------------------------------------
    case 80001:
      return (
        <TestnetChainLogoWrapper
          logo={PolygonLogo}
          chainId={chainId}
          {...props}
        />
      );
    case 11155111:
      return (
        <TestnetChainLogoWrapper
          logo={EthereumLogo}
          chainId={chainId}
          {...props}
        />
      );
    default:
      return <BaseLogo {...props} />;
  }
};
