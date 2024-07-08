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

import {
  BaseLayerWrapper,
  SettingsPageWrapper,
  HStackFull,
  BannerSection,
} from "@lightdotso/ui";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { NavSidebar } from "@/components/nav/nav-sidebar";
import { TITLES } from "@/const";

// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

const navSidebarItems = [
  {
    title: TITLES.WalletSettings.subcategories["Wallet Settings"].title,
    href: "/settings",
  },
  {
    title: TITLES.WalletSettings.subcategories["Billing"].title,
    href: "/settings/billing",
  },
  {
    title: TITLES.WalletSettings.subcategories["Deployment"].title,
    href: "/settings/deployment",
  },
  {
    title: TITLES.WalletSettings.subcategories["Notifications"].title,
    href: "/settings/notifications",
  },
];

// -----------------------------------------------------------------------------
// Metadata
// -----------------------------------------------------------------------------

export const metadata: Metadata = {
  title: TITLES.WalletSettings.title,
  description: TITLES.WalletSettings.description,
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
      title={TITLES.WalletSettings.title}
      description={TITLES.WalletSettings.description}
      size="sm"
    >
      <HStackFull>
        <BaseLayerWrapper size="sm">
          <SettingsPageWrapper
            nav={<NavSidebar baseRef items={navSidebarItems} />}
          >
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
