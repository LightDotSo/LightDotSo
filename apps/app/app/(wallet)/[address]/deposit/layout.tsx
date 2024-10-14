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

import { ACTION_NAV_TABS } from "@/app/(wallet)/[address]/(const)/nav-tabs";
import { LinkButtonGroup } from "@/components/section/link-button-group";
import { TITLES } from "@/const";
import { BannerSection } from "@lightdotso/ui/sections";
import {
  BaseLayerWrapper,
  BasicPageWrapper,
  DialogSectionWrapper,
  MiddleLayerWrapper,
} from "@lightdotso/ui/wrappers";
import type { Metadata } from "next";
import type { ReactNode } from "react";

// -----------------------------------------------------------------------------
// Metadata
// -----------------------------------------------------------------------------

export const metadata: Metadata = {
  title: TITLES.Deposit.title,
  description: TITLES.Deposit.description,
};

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface DepositLayoutProps {
  children: ReactNode;
}

// -----------------------------------------------------------------------------
// Layout
// -----------------------------------------------------------------------------

export default function DepositsLayout({ children }: DepositLayoutProps) {
  return (
    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    <>
      <BannerSection
        title={TITLES.Deposit.title}
        description={TITLES.Deposit.description}
        size="xxs"
      >
        <MiddleLayerWrapper size="xxs">
          <LinkButtonGroup tabs={ACTION_NAV_TABS} />
        </MiddleLayerWrapper>
      </BannerSection>
      <BaseLayerWrapper size="xxs">
        <BasicPageWrapper>
          <DialogSectionWrapper>{children}</DialogSectionWrapper>
        </BasicPageWrapper>
      </BaseLayerWrapper>
    </>
  );
}

// -----------------------------------------------------------------------------
// Data
// -----------------------------------------------------------------------------

export const revalidate = 300;
