/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable @next/next/no-img-element */
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
import type { ReactNode } from "react";
import OriginalLayout from "@/app/(wallet)/[address]/transactions/layout";
import { DEMO_WALLET_ADDRESS } from "@/const";
import { TITLES } from "@/const";

// -----------------------------------------------------------------------------
// Metadata
// -----------------------------------------------------------------------------

export const metadata: Metadata = {
  title: TITLES.Demo.subcategories.Transactions.title,
  description: TITLES.Demo.subcategories.Transactions.description,
};

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type LayoutProps = {
  children: ReactNode;
  nav: ReactNode;
};

// -----------------------------------------------------------------------------
// Original Layout
// -----------------------------------------------------------------------------

export default async function Layout({ children, nav }: LayoutProps) {
  return OriginalLayout({
    params: { address: DEMO_WALLET_ADDRESS },
    children,
    nav,
  });
}
