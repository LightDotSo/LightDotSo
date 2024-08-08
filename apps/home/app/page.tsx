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

import { Grid } from "@/components/grid";
import { Menu } from "@/components/menu";
import { Spiral } from "@/components/spiral";
import { LightHorizontalLogo } from "@lightdotso/svg";
import { Button } from "@lightdotso/ui";
import { Compass, Gamepad } from "lucide-react";
import { Cta } from "./(components)/cta";
import { Unified } from "./(components)/unified";

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default async function Page() {
  return (
    <div>
      <Spiral />
      <div className="mt-2 flex justify-center">
        <div className="absolute z-50">
          <Menu />
        </div>
      </div>
      <div className="relative z-10 flex h-screen flex-col items-center justify-center">
        <div className="m-auto w-full max-w-3xl p-4">
          <LightHorizontalLogo className="size-32" />
          <h1 className="font-medium text-4xl leading-8 tracking-tight md:leading-10 lg:text-6xl">
            <span className="mb-2 block">EVM chain abstraction</span>
            <span className="mb-2 block">protocol unifying all</span>
            <span className="mb-2 block">chains as one.</span>
          </h1>
          <div className="py-8">
            <Button asChild size="lg" className="rounded-lg px-6 py-5">
              <a href="/">
                <Compass className="mr-2 size-6" /> Explore Now
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="ml-4 rounded-lg px-6 py-5"
            >
              <a href="/demo/overview">
                <Gamepad className="mr-2 size-6" /> Start Demo
              </a>
            </Button>
          </div>
        </div>
      </div>
      <div className="relative z-10 flex h-screen flex-col items-center justify-center">
        <div className="m-auto max-w-3xl border-t">
          <div className="mt-8 text-thin">Introduction</div>
          <h1 className="mt-8 font-medium text-4xl leading-8 tracking-tight md:leading-10 lg:text-6xl">
            Use Ethereum as One.
          </h1>
          <p className="mt-12 font-base text-base text-xl">
            Light enables using Ethereum, and EVM chains as seamless as
            possible. Designed from the ground up for the rollup/multi-chain
            world that we live in, Light enables you to use Ethereum like it is
            one.
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
        <Grid className="mt-20" />
      </div>
      <Unified />
      <Cta />
    </div>
  );
}
