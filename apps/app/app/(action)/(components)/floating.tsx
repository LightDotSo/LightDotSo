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

import { FloatingIcon } from "@/app/(action)/(components)/floating-icon";
import { BaseLayout } from "@/app/(action)/(layouts)/base-layout";
import { MAINNET_CHAINS } from "@lightdotso/const";
import { shuffleArray } from "@lightdotso/utils";
import type { ReactNode } from "react";
import type { Chain } from "viem";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const Floating = ({ children }: { children: ReactNode }) => {
  // ---------------------------------------------------------------------------
  // Const
  // ---------------------------------------------------------------------------

  const chains = shuffleArray<Chain>([...MAINNET_CHAINS]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="relative flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-y-0 left-0 z-0 w-full lg:z-10 lg:w-1/3 lg:blur-0">
        <FloatingIcon
          className="top-[10%] left-[10%] hidden lg:block"
          chainId={chains[0].id}
          chainName={chains[0].name}
        />
        <FloatingIcon
          className="top-[15%] right-[15%] hidden lg:block"
          chainId={chains[1].id}
          chainName={chains[1].name}
        />
        <FloatingIcon
          className="top-[30%] left-[40%] hidden lg:block"
          chainId={chains[2].id}
          chainName={chains[2].name}
        />
        <FloatingIcon
          className="top-1/2 right-[10%] hidden xl:block"
          chainId={chains[3].id}
          chainName={chains[3].name}
        />
        <FloatingIcon
          className="bottom-[30%] left-[30%] hidden lg:block"
          chainId={chains[4].id}
          chainName={chains[4].name}
        />
        <FloatingIcon
          className="right-[10%] bottom-[10%] hidden lg:block"
          chainId={chains[5].id}
          chainName={chains[5].name}
        />
      </div>
      <div className="relative z-10 w-full lg:z-0">
        <BaseLayout>
          <div className="my-8 bg-opacity-100 text-center">
            <h1 className="font-bold text-6xl tracking-tight">
              All Chains. <br /> All Tokens. One Click.
            </h1>
          </div>
          {children}
        </BaseLayout>
      </div>
      <div className="absolute inset-y-0 right-0 z-0 w-full blur-lg lg:z-10 lg:w-1/3 lg:blur-0">
        <FloatingIcon
          className="top-[10%] right-[10%]"
          chainId={chains[6].id}
          chainName={chains[6].name}
        />
        <FloatingIcon
          className="top-[15%] left-[15%]"
          chainId={chains[7].id}
          chainName={chains[7].name}
        />
        <FloatingIcon
          className="top-[30%] right-[20%]"
          chainId={chains[8].id}
          chainName={chains[8].name}
        />
        <FloatingIcon
          className="top-[40%] left-[10%] hidden xl:block"
          chainId={chains[9].id}
          chainName={chains[9].name}
        />
        <FloatingIcon
          className="right-[30%] bottom-[40%]"
          chainId={chains[10].id}
          chainName={chains[10].name}
        />
        <FloatingIcon
          className="right-[20%] bottom-[20%]"
          chainId={chains[11].id}
          chainName={chains[11].name}
        />
        <FloatingIcon
          className="bottom-[10%] left-[10%]"
          chainId={chains[12].id}
          chainName={chains[12].name}
        />
      </div>
    </div>
  );
};
