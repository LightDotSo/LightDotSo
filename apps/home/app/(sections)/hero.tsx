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

import { BetaVersion } from "@/components/beta-version";
import { Button } from "@lightdotso/ui/components/button";
import { Compass, Gamepad } from "lucide-react";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const Hero: FC = () => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="relative my-8 flex flex-col items-center justify-center px-2">
      <div className="m-auto w-full max-w-5xl">
        <div className="mb-8">
          <BetaVersion />
        </div>
        <h1 className="font-medium text-4xl leading-8 tracking-tight md:leading-10 lg:text-6xl">
          <span className="mb-2 inline md:block">EVM chain abstraction </span>
          <span className="mb-2 inline md:block">protocol unifying all </span>
          <span className="mb-2 inline md:block">chains as one.</span>
        </h1>
        <div className="flex flex-col items-center justify-start gap-4 py-8 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="w-full rounded-lg px-6 py-5 sm:w-auto"
          >
            <a href="/">
              <Compass className="mr-2 size-6" /> Explore Now
            </a>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="w-full rounded-lg px-6 py-5 sm:w-auto"
          >
            <a href="/demo/overview">
              <Gamepad className="mr-2 size-6" /> Start Demo
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};
