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
import { BannerLayout } from "@/app/banner";

export const metadata: Metadata = {
  title: "New Wallet",
  description: "Create a new wallet.",
};

interface NewWalletLayoutProps {
  children: React.ReactNode;
}

export default function NewWalletLayout({ children }: NewWalletLayoutProps) {
  return (
    <>
      <BannerLayout
        title="New Wallet"
        description="Create your own new Light Wallet."
      >
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <div className="mx-auto max-w-7xl flex-1">{children}</div>
        </div>
      </BannerLayout>
    </>
  );
}
