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

import { Button } from "@lightdotso/ui/components/button";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import type { FC } from "react";
import { SwapDialogLoader } from "../(components)/swap-dialog-loader";
import { SectionPill } from "../../src/components/section-pill";
import { Spark } from "../../src/components/spark";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const Swap: FC = () => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex justify-center">
      <div className="relative z-10 mx-3 flex w-full max-w-[1536px] flex-col items-center justify-center overflow-hidden rounded-md bg-background-stronger py-16 md:mx-6 md:py-28">
        <Spark />
        <div className="w-full max-w-5xl p-6">
          <div className="flex flex-col justify-between md:flex-row">
            <div className="flex-col">
              <div className="mt-8">
                <SectionPill title="Swap" description="New" />
              </div>
              <div className="mt-8">
                <h1 className="font-medium text-3xl leading-8 tracking-tight sm:text-4xl md:leading-10 lg:text-5xl">
                  Light Swaps
                </h1>
                <span className="mt-4 block">Something's on the horizon.</span>
                {/* <h1 className="font-medium text-3xl leading-8 tracking-tight sm:text-4xl md:leading-10 lg:text-5xl">
                <span className="mb-2 inline md:block">All chains. </span>
                <span className="mb-2 inline md:block">All tokens. </span>
                <span className="mb-2 inline md:block">One click.</span>
              </h1> */}
                {/* <span className="mt-4 block">
                Instantly swap accross all chains in one click.
              </span> */}
              </div>
              <div className="py-8 md:pb-0">
                <Button
                  asChild
                  className="rounded-full bg-opacity-80 px-4"
                  size="lg"
                  variant="shadow"
                >
                  <a href="/swap">
                    See Preview
                    <ChevronRightIcon className="ml-2 size-4" />
                  </a>
                </Button>
              </div>
            </div>
            <div className="max-w-md rounded-xl bg-background-body p-4">
              <SwapDialogLoader />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
