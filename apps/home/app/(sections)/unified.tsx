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

import { NextImage } from "@lightdotso/elements/next-image";
import type { FC } from "react";
import { SectionPill } from "../../src/components/section-pill";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const Unified: FC = () => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="relative z-10 flex flex-col items-center justify-center bg-background-stronger p-4">
      <div className="m-auto mt-12 w-full w-full max-w-5xl border-border-strong border-t sm:mt-16 md:mt-32">
        <div className="mt-8">
          <SectionPill title="Features" description="Upgraded" />
        </div>
        <h1 className="mt-8 font-medium text-4xl leading-8 tracking-tight md:leading-10 lg:text-6xl">
          An Unified Crypto Experience.
        </h1>
      </div>
      <div className="mt-16 grid w-full max-w-5xl grid-cols-1 gap-5 md:grid-cols-3">
        <UnifiedCard
          title="Gasless"
          description="No need to bridge, or refuel across chains. Select any asset you own across chains to pay for gas."
          imageUrl="https://assets.light.so/home/gasless.png"
        />
        <UnifiedCard
          title="All Chains. One Click."
          description="A single smart wallet will work across all chains without security compromise."
          imageUrl="https://assets.light.so/home/all-chains.png"
        />
        <UnifiedCard
          title="Programmable Execution"
          description="One signature, batch execute across chains. No need for multiple clicks, it all works with one single signature."
          imageUrl="https://assets.light.so/home/programmable-execution.png"
        />
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export interface UnifiedCardProps {
  title: string;
  description: string;
  imageUrl: string;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const UnifiedCard: FC<UnifiedCardProps> = ({
  title,
  description,
  imageUrl,
}) => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="col-span-1 flex w-full flex-col rounded-xl bg-black">
      <div className="flex-grow p-4 md:p-8">
        <div className="font-bold font-normal text-text-inverse text-xl sm:text-3xl">
          {title}
        </div>
        <p className="mt-2 text-text-weak tracking-wide">{description}</p>
      </div>
      <div className="-mt-36 md:-mt-40">
        <NextImage
          className="w-full"
          alt={title}
          src={imageUrl}
          width={572}
          height={690}
        />
      </div>
    </div>
  );
};
