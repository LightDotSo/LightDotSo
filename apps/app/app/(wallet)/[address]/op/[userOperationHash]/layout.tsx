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

import { OpInvokeButton } from "@/app/(wallet)/[address]/op/[userOperationHash]/(components)/op-invoke-button";
import { TITLES } from "@/const";
import { handler } from "@/handlers/[address]/op/[userOperationHash]/handler";
import { BannerSection } from "@lightdotso/ui/sections";
import {
  BaseLayerWrapper,
  BasicPageWrapper,
  MiddleLayerWrapper,
} from "@lightdotso/ui/wrappers";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import type { Address, Hex } from "viem";

// -----------------------------------------------------------------------------
// Metadata
// -----------------------------------------------------------------------------

export const metadata: Metadata = {
  title: TITLES.UserOperation.title,
  description: TITLES.UserOperation.description,
};

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface UserOperationLayoutProps {
  children: ReactNode;
  params: Promise<{
    address: string;
    userOperationHash: string;
  }>;
}

// -----------------------------------------------------------------------------
// Layout
// -----------------------------------------------------------------------------

export default async function UserOperationLayout({
  children,
  params,
}: UserOperationLayoutProps) {
  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  await handler(await params);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      <BannerSection
        title={TITLES.Transactions.title}
        description={TITLES.Transactions.description}
        size="sm"
      >
        <MiddleLayerWrapper size="sm">
          <div className="flex w-full justify-end">
            <OpInvokeButton
              address={(await params).address as Address}
              userOperationHash={(await params).userOperationHash as Hex}
            />
          </div>
        </MiddleLayerWrapper>
      </BannerSection>
      <BaseLayerWrapper size="sm">
        <BasicPageWrapper>{children}</BasicPageWrapper>
      </BaseLayerWrapper>
    </>
  );
}

// -----------------------------------------------------------------------------
// Data
// -----------------------------------------------------------------------------

export const revalidate = 300;
