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

import type { Metadata } from "next";
import type { ReactNode } from "react";
import OriginalLayout from "@/app/(wallet)/[address]/overview/layout";
import { DEMO_WALLET_ADDRESS, TITLES } from "@/const";

// -----------------------------------------------------------------------------
// Metadata
// -----------------------------------------------------------------------------

export const metadata: Metadata = {
  title: TITLES.Demo.subcategories.Overview.title,
  description: TITLES.Demo.subcategories.Overview.description,
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
    children: children,
    nav: nav,
  });
}

// -----------------------------------------------------------------------------
// Data
// -----------------------------------------------------------------------------

export const revalidate = 300;
