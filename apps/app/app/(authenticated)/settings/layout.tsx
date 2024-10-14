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

import { NavSidebar } from "@/components/nav/nav-sidebar";
import { TITLES } from "@/const";
import type { Tab } from "@lightdotso/types";
import { BannerSection } from "@lightdotso/ui/sections";
import { HStackFull } from "@lightdotso/ui/stacks";
import { BaseLayerWrapper, SettingsPageWrapper } from "@lightdotso/ui/wrappers";
import type { Metadata } from "next";
import type { ReactNode } from "react";

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const navSidebarTabs: Tab[] = [
  {
    title: "Profile",
    href: "/settings",
    id: "profile",
  },
  {
    title: "Appearance",
    href: "/settings/appearance",
    id: "appearance",
  },
  {
    title: "Notifications",
    href: "/settings/notifications",
    id: "notifications",
  },
];

// -----------------------------------------------------------------------------
// Metadata
// -----------------------------------------------------------------------------

export const metadata: Metadata = {
  title: TITLES.Settings.title,
  description: TITLES.Settings.description,
};

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface SettingsLayoutProps {
  children: ReactNode;
}

// -----------------------------------------------------------------------------
// Layout
// -----------------------------------------------------------------------------

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <BannerSection
      title={TITLES.Settings.title}
      description={TITLES.Settings.description}
      size="sm"
    >
      <HStackFull>
        <BaseLayerWrapper size="sm">
          <SettingsPageWrapper nav={<NavSidebar tabs={navSidebarTabs} />}>
            {children}
          </SettingsPageWrapper>
        </BaseLayerWrapper>
      </HStackFull>
    </BannerSection>
  );
}

// -----------------------------------------------------------------------------
// Data
// -----------------------------------------------------------------------------

export const revalidate = 300;
