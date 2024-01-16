// Copyright (C) 2023 Light, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import {
  BaseLayerWrapper,
  SettingsPageWrapper,
  HStackFull,
} from "@lightdotso/ui";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SidebarNav } from "@/components/nav/sidebar-nav";
import { BannerSection } from "@/components/section/banner-section";
import { TITLES } from "@/const";

// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

const sidebarNavItems = [
  {
    title: TITLES.Settings.subcategories["Wallet Settings"].title,
    href: "/settings",
  },
  {
    title: TITLES.Settings.subcategories["Billing"].title,
    href: "/settings/billing",
  },
  {
    title: TITLES.Settings.subcategories["Deployment"].title,
    href: "/settings/deployment",
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
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <BannerSection
      title={TITLES.Settings.title}
      description={TITLES.Settings.description}
      size="sm"
    >
      <HStackFull>
        <BaseLayerWrapper size="sm">
          <SettingsPageWrapper
            nav={<SidebarNav baseRef items={sidebarNavItems} />}
          >
            {children}
          </SettingsPageWrapper>
        </BaseLayerWrapper>
      </HStackFull>
    </BannerSection>
  );
}
