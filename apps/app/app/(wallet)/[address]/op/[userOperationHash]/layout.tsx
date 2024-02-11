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
  BasicPageWrapper,
  BannerSection,
  MiddleLayerWrapper,
} from "@lightdotso/ui";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import type { Hex } from "viem";
import { OpInvokeButton } from "@/app/(wallet)/[address]/op/[userOperationHash]/(components)/op-invoke-button";
import { TITLES } from "@/const";
import { handler } from "@/handlers/paths/[address]/op/[userOperationHash]/handler";

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
  params: {
    address: string;
    userOperationHash: string;
  };
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

  await handler(params);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      <BannerSection
        title={TITLES.Transactions.title}
        description={TITLES.Transactions.description}
      >
        <MiddleLayerWrapper>
          <div className="flex w-full justify-end">
            <OpInvokeButton
              userOperationHash={params.userOperationHash as Hex}
            />
          </div>
        </MiddleLayerWrapper>
      </BannerSection>
      <BaseLayerWrapper>
        <BasicPageWrapper>{children}</BasicPageWrapper>
      </BaseLayerWrapper>
    </>
  );
}
