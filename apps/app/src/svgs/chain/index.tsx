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

import type { FC } from "react";
import { ArbitrumLogo } from "./arbitrum";
import { AvalancheLogo } from "./avalanche";
import { BaseLogo } from "./base";
import { BscLogo } from "./bsc";
import { EthereumLogo } from "./ethereum";
import { OptimismLogo } from "./optimism";
import { PolygonLogo } from "./polygon";

interface ChainLogoProps extends React.SVGProps<SVGSVGElement> {
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
    default:
      return <BaseLogo {...props} />;
  }
};
