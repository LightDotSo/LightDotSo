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

import type { FC } from "react";
import { Grid } from "../../src/components/grid";
import { SectionPill } from "../../src/components/section-pill";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const Introduction: FC = () => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="relative z-10 flex flex-col items-center justify-center px-4">
      <div className="m-auto mt-8 mb-24 max-w-3xl border-border-inverse-weaker border-t sm:mt-16 md:mt-32 md:mb-64">
        <div className="mt-8 text-thin">
          <SectionPill title="Introduction" description="Public Beta" />
        </div>
        <h1 className="mt-8 font-medium text-4xl leading-8 tracking-tight md:leading-10 lg:text-6xl">
          Use Ethereum as One.
        </h1>
        <p className="mt-12 mb-40 font-base text-base text-text text-xl md:text-2xl">
          Light enables using Ethereum, and EVM chains as seamless as possible.
          Designed from the ground up for the rollup/multi-chain world that we
          live in, Light enables you to use Ethereum like it is one.
          <br />
          <br />
          Say goodbye to mundane bridging, gas deposits and refueling gas, or
          having multiple smart contract wallets for each chain. With Light,
          users are able to use a single smart account across chains allowing
          for maximum composability and usability.
          <br />
          <br />
          Light aims to help realize the vision of Ethereum making abstracting
          away the complexities of fragmentation while aligning w/ the core
          ethos as an 100% open source project.
        </p>
      </div>
      <div className="absolute right-0 bottom-0 left-0">
        <Grid />
      </div>
    </div>
  );
};
