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

import type { Metadata } from "next";
import { BannerSection } from "@/components/section/banner-section";
import { HStackFull } from "@/components/stack/h-stack-full";
import { BaseLayerWrapper } from "@/components/wrapper/layer/base-layer-wrapper";
import { BasicPageWrapper } from "@/components/wrapper/page/basic-page-wrapper";

// -----------------------------------------------------------------------------
// Metadata
// -----------------------------------------------------------------------------

export const metadata: Metadata = {
  title: "New Wallet",
  description: "Create a new wallet.",
};

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface NewWalletLayoutProps {
  children: React.ReactNode;
}

// -----------------------------------------------------------------------------
// Layout
// -----------------------------------------------------------------------------

export default function NewWalletLayout({ children }: NewWalletLayoutProps) {
  return (
    <>
      <BannerSection
        title="New Wallet"
        description="Create your own new Light Wallet."
      >
        <HStackFull>
          <BaseLayerWrapper>
            <BasicPageWrapper>{children}</BasicPageWrapper>
          </BaseLayerWrapper>
        </HStackFull>
      </BannerSection>
    </>
  );
}
