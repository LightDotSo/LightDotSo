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

import { TITLES } from "@/const";
import { BannerSection } from "@lightdotso/ui/sections";
import { HStackFull } from "@lightdotso/ui/stacks";
import { BaseLayerWrapper, BasicPageWrapper } from "@lightdotso/ui/wrappers";
import type { Metadata } from "next";
import type { ReactNode } from "react";

// -----------------------------------------------------------------------------
// Metadata
// -----------------------------------------------------------------------------

export const metadata: Metadata = {
  title: TITLES.Dev.title,
  description: TITLES.Dev.description,
};

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface DevLayoutProps {
  children: ReactNode;
}

// -----------------------------------------------------------------------------
// Layout
// -----------------------------------------------------------------------------

export default function DevLayout({ children }: DevLayoutProps) {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <BannerSection
      title={TITLES.Dev.title}
      description={TITLES.Dev.description}
      size="sm"
    >
      <HStackFull>
        <BaseLayerWrapper size="sm">
          <BasicPageWrapper>{children}</BasicPageWrapper>
        </BaseLayerWrapper>
      </HStackFull>
    </BannerSection>
  );
}

// -----------------------------------------------------------------------------
// Data
// -----------------------------------------------------------------------------

export const revalidate = 300;
