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

import { ACTION_NAV_ITEMS } from "@/app/(action)/(const)/nav-items";
import { FloatingIcon } from "@/app/(action)/swap/(components)/floating-icon";
import { Loader } from "@/app/(action)/swap/loader";
import { LinkButtonGroup } from "@/components/section/link-button-group";
import { TITLES } from "@/const";
import { MAINNET_CHAINS } from "@lightdotso/const";
import { BaseLayerWrapper, MinimalPageWrapper } from "@lightdotso/ui/wrappers";
import { shuffleArray } from "@lightdotso/utils";
import type { Metadata } from "next";
import type { Chain } from "viem";

// -----------------------------------------------------------------------------
// Metadata
// -----------------------------------------------------------------------------

export const metadata: Metadata = {
  title: {
    template: `${TITLES.Swap.title} | %s`,
    default: TITLES.Swap.title,
  },
  description: TITLES.Swap.description,
};

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default async function Page() {
  // ---------------------------------------------------------------------------
  // Const
  // ---------------------------------------------------------------------------

  const chains = shuffleArray<Chain>(MAINNET_CHAINS);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      <div className="relative flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-1/3">
          <FloatingIcon
            className="top-[10%] left-[10%]"
            chainId={chains[0].id}
          />
          <FloatingIcon
            className="top-[15%] right-[15%]"
            chainId={chains[1].id}
          />
          <FloatingIcon
            className="top-[30%] left-[40%]"
            chainId={chains[2].id}
          />
          <FloatingIcon
            className="top-1/2 right-[10%]"
            chainId={chains[3].id}
          />
          <FloatingIcon
            className="bottom-[30%] left-[30%]"
            chainId={chains[4].id}
          />
          <FloatingIcon
            className="right-[10%] bottom-[10%]"
            chainId={chains[5].id}
          />
        </div>
        {/* Main Content */}
        <BaseLayerWrapper size="xxs">
          <MinimalPageWrapper className="p-2" isScreen>
            <div className="my-8 text-center">
              <h1 className="font-bold text-6xl tracking-tight">
                All Chains. <br /> All Tokens. One Click.
              </h1>
            </div>
            <LinkButtonGroup items={ACTION_NAV_ITEMS} />
            <Loader />
          </MinimalPageWrapper>
        </BaseLayerWrapper>
        <div className="absolute inset-y-0 right-0 w-1/3">
          <FloatingIcon
            className="top-[10%] right-[10%]"
            chainId={chains[6].id}
          />
          <FloatingIcon
            className="top-[15%] left-[15%]"
            chainId={chains[7].id}
          />
          <FloatingIcon
            className="top-[30%] right-[20%]"
            chainId={chains[8].id}
          />
          <FloatingIcon
            className="top-[40%] left-[10%]"
            chainId={chains[9].id}
          />
          <FloatingIcon
            className="right-[30%] bottom-[40%]"
            chainId={chains[10].id}
          />
          <FloatingIcon
            className="right-[20%] bottom-[20%]"
            chainId={chains[11].id}
          />
          <FloatingIcon
            className="bottom-[10%] left-[10%]"
            chainId={chains[12].id}
          />
        </div>
      </div>
    </>
  );
}
