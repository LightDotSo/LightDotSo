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

import { MagicContainer } from "@/components/magic-container";
import { SectionPill } from "@/components/section-pill";
import { ECOSYSTEM_CHAINS, type EcosystemChain } from "@/const/ecosystem";
import { ExternalLink } from "@lightdotso/elements";
import { ChainLogo } from "@lightdotso/svg";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export interface ChainCardProps {
  chain: EcosystemChain;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const ChainCard: FC<ChainCardProps> = ({ chain }) => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  // return (
  //   <MagicCard
  //     backgroundColor="bg-background-weak"
  //     className="col-span-1 w-full p-4"
  //   >
  //     <ChainLogo chainId={chain.id} size="lg" />
  //     <p className="mt-2 font-bold font-normal text-lg text-text-stronger sm:text-xl">
  //       {chain?.name}
  //     </p>
  //     <p className="text-text-weak tracking-tighter">{chain?.description}</p>
  //   </MagicCard>
  // );

  return (
    <div className="col-span-1 flex h-full w-full flex-col p-4">
      <div>
        <ChainLogo chainId={chain.id} size="lg" />
        <p className="mt-2 font-bold font-normal text-lg text-text-stronger sm:text-xl">
          {chain?.name}
        </p>
        <p className="mt-3 text-text-weak tracking-tighter">
          {chain?.description}
        </p>
      </div>
      <div className="mt-auto pt-4">
        <ExternalLink
          className="text-text underline hover:text-text-weak"
          href={chain?.websiteUrl}
        >
          See details
        </ExternalLink>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const Ecosystem: FC = () => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="relative z-10 flex flex-col items-center justify-center py-20">
      <div className="m-auto w-full max-w-5xl border-border-strong border-t">
        <div className="mt-8">
          <SectionPill title="Ecosystem" description="Chains" />
        </div>
        <h1 className="mt-8 font-medium text-4xl text-text-strong leading-8 tracking-tight md:leading-10 lg:text-6xl">
          Light brings all chains as one.
        </h1>
      </div>
      <MagicContainer className="mt-16 grid w-full max-w-5xl grid-cols-4 gap-5">
        {ECOSYSTEM_CHAINS.slice(0, 20).map((chain) => (
          <ChainCard key={chain.id} chain={chain} />
        ))}
      </MagicContainer>
    </div>
  );
};