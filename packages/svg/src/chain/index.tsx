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

import { cn, getChainById, shortenName } from "@lightdotso/utils";
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
import { BlastLogo } from "./blast";
import { BscLogo } from "./bsc";
import { CeloLogo } from "./celo";
import { EthereumLogo } from "./ethereum";
import { GnosisLogo } from "./gnosis";
import { OptimismLogo } from "./optimism";
import { PolygonLogo } from "./polygon";

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
  <span className="relative inline-block">
    <Logo {...props} />
    <span
      className={cn(
        "absolute bottom-0 right-0 inline-flex size-2 items-center justify-center rounded-full border border-border-primary-weak bg-background-stronger p-1 text-[6px]",
        props.className?.includes("h-6 w-6") && "size-3 text-[8px]",
      )}
    >
      {shortenName(getChainById(chainId).name)}
    </span>
  </span>
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
    case 10:
      return <OptimismLogo {...props} />;
    case 56:
      return <BscLogo {...props} />;
    case 100:
      return <GnosisLogo {...props} />;
    case 137:
      return <PolygonLogo {...props} />;
    case 8453:
      return <BaseLogo {...props} />;
    case 43114:
      return <AvalancheLogo {...props} />;
    case 42161:
      return <ArbitrumLogo {...props} />;
    case 42220:
      return <CeloLogo {...props} />;

    // -------------------------------------------------------------------------
    // Testnet
    // -------------------------------------------------------------------------

    case 44787:
      return (
        <TestnetChainLogoWrapper logo={CeloLogo} chainId={chainId} {...props} />
      );
    case 80001:
      return (
        <TestnetChainLogoWrapper
          logo={PolygonLogo}
          chainId={chainId}
          {...props}
        />
      );
    case 84532:
      return (
        <TestnetChainLogoWrapper logo={BaseLogo} chainId={chainId} {...props} />
      );
    case 421614:
      return (
        <TestnetChainLogoWrapper
          logo={ArbitrumLogo}
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
    case 11155420:
      return (
        <TestnetChainLogoWrapper
          logo={OptimismLogo}
          chainId={chainId}
          {...props}
        />
      );
    case 168587773:
      return (
        <TestnetChainLogoWrapper
          logo={BlastLogo}
          chainId={chainId}
          {...props}
        />
      );
    default:
      return <BaseLogo {...props} />;
  }
};
