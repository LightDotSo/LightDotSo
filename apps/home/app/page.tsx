// Copyright 2023-2024 Light
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

import { LightorizontalLogo } from "@lightdotso/svg";
import { Button } from "@lightdotso/ui";
import { Spiral } from "@/components/spiral";

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default async function Page() {
  return (
    <div>
      <Spiral />
      <div className="relative z-10 flex h-screen flex-col items-center justify-center">
        <div className="p-4">
          <LightorizontalLogo className="size-32" />
          <h1 className="max-w-2xl text-4xl font-extrabold lg:text-6xl">
            EVM chain abstraction
            <br />
            protocol unifying all
            <br />
            chains as one.
          </h1>
          <div className="py-8">
            <Button size="lg">Explore Now</Button>
            <Button size="lg" variant="outline" className="ml-4">
              Learn More
            </Button>
          </div>
        </div>
      </div>
      <div className="relative z-10 flex h-screen flex-col items-center justify-center">
        <div className="m-auto max-w-2xl text-2xl font-bold">
          Lightenables using Ethereum, and EVM chains as seamless as possible.
          Designed from the ground up for the rollup/multi-chain world that we
          live in, Lightenables you to use Ethereum like it is one. Say goodbye
          to mundane bridging, gas deposits and refueling gas, or having
          multiple smart contract wallets for each chain. With Light users are
          able to use a single smart account across chains allowing for maximum
          composability and usability. Lightaims to help realize the vision of
          Ethereum making abstracting the complexities of fragmentation while
          aligning w/ the core ethos as an 100% open source project.
        </div>
      </div>
    </div>
  );
}
