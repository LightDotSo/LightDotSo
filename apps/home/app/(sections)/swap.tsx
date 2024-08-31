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

import { SwapDialogLoader } from "@/app/(components)/swap-dialog-loader";
import { SectionPill } from "@/components/section-pill";
import { Spark } from "@/components/spark";
import { Button } from "@lightdotso/ui/components/button";
import { ArrowRight } from "lucide-react";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const Swap: FC = () => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="relative z-10 m-auto flex max-w-[1536px] flex-col items-center justify-center overflow-hidden rounded-md bg-background-stronger py-16 md:py-28">
      <Spark />
      <div className="m-auto w-full max-w-5xl p-6">
        <div className="flex flex-col justify-between md:flex-row">
          <div className="flex-col">
            <div className="mt-8">
              <SectionPill title="Swap" description="New" />
            </div>
            <div className="mt-8">
              <h1 className="font-medium text-3xl leading-8 tracking-tight sm:text-4xl md:leading-10 lg:text-5xl">
                <span className="mb-2 inline md:block">All chains. </span>
                <span className="mb-2 inline md:block">All tokens. </span>
                <span className="mb-2 inline md:block">One click.</span>
              </h1>
              <span className="mt-4 block">
                Instantly swap accross all chains in one click.
              </span>
            </div>
            <div className="py-8">
              <Button asChild className="rounded-xl" size="lg">
                <a href="/swap">
                  Try it out
                  <ArrowRight className="ml-2 size-4" />
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
  );
};
