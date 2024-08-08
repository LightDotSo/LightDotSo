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

import { NextImage } from "@lightdotso/elements";
import type { FC } from "react";

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
    <div className="relative col-span-1 w-full rounded-md bg-black">
      <div className="absolute top-0 right-0 left-0 p-4">
        <p className="font-bold font-normal text-white text-xl sm:text-3xl">
          {title}
        </p>
        <p className="mt-2 text-gray-300 tracking-tighter">{description}</p>
      </div>
      <NextImage
        className="relative mt-12"
        alt={title}
        src={imageUrl}
        width={572}
        height={690}
        style={{ width: "100%", height: "auto", objectFit: "cover" }}
      />
    </div>
  );
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const Unified: FC = () => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="relative z-10 flex flex-col items-center justify-center bg-background-stronger py-20">
      <div className="m-auto w-full w-full max-w-5xl border-border-strong border-t">
        <div className="mt-8 text-thin">Features</div>
        <h1 className="mt-8 font-medium text-4xl leading-8 tracking-tight md:leading-10 lg:text-6xl">
          An Unified Crypto Experience.
        </h1>
      </div>
      <div className="mt-16 grid w-full max-w-5xl grid-cols-3 gap-5">
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
