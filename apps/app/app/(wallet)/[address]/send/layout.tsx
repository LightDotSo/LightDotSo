// Copyright 2023-2024 Light, Inc.
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

import {
  BaseLayerWrapper,
  MiddleLayerWrapper,
  BasicPageWrapper,
  BannerSection,
  DialogSectionWrapper,
} from "@lightdotso/ui";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ACTION_NAV_ITEMS } from "@/app/(wallet)/[address]/(const)/nav-items";
import { LinkButtonGroup } from "@/components/section/link-button-group";
import { TITLES } from "@/const";

// -----------------------------------------------------------------------------
// Metadata
// -----------------------------------------------------------------------------

export const metadata: Metadata = {
  title: TITLES.Send.title,
  description: TITLES.Send.description,
};

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface SendLayoutProps {
  children: ReactNode;
}

// -----------------------------------------------------------------------------
// Layout
// -----------------------------------------------------------------------------

export default function SendLayout({ children }: SendLayoutProps) {
  return (
    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    <>
      <BannerSection
        title={TITLES.Send.title}
        description={TITLES.Send.description}
        size="xs"
      >
        <MiddleLayerWrapper size="xs">
          <LinkButtonGroup items={ACTION_NAV_ITEMS} />
        </MiddleLayerWrapper>
      </BannerSection>
      <BaseLayerWrapper size="xs">
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
