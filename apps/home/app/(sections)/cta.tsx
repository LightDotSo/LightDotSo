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

import { LightAppLogo } from "@lightdotso/svg";
import { Button } from "@lightdotso/ui/components/button";
import { Compass, Gamepad } from "lucide-react";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const Cta: FC = () => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="relative z-10 flex flex-col items-center justify-center px-2 py-20">
      <div className="m-auto w-full max-w-5xl">
        <LightAppLogo className="size-30" />
        <div className="mt-8">
          <h1 className="font-medium text-2xl leading-8 tracking-tight md:leading-10 lg:text-5xl">
            Experience Now
          </h1>
          <span className="mt-4 block">
            Try our latest beta and shape our app with your feedback!
          </span>
        </div>
        <div className="py-8">
          <Button asChild className="rounded-lg ">
            <a href="/">
              <Compass className="mr-2 size-4" />
              Start Now
            </a>
          </Button>
          <Button asChild variant="outline" className="ml-4 rounded-lg">
            <a href="/demo/overview">
              <Gamepad className="mr-2 size-4" />
              Open Demo
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};
