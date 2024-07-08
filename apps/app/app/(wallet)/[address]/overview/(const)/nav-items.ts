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

import { OverviewSubCategory } from "@/const";

// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

export const OVERVIEW_NAV_ITEMS = [
  {
    title: "All",
    href: "/overview",
    id: "overview",
    category: OverviewSubCategory.All,
  },
  {
    title: "Tokens",
    href: "/overview/tokens",
    id: "tokens",
    category: OverviewSubCategory.Tokens,
  },
  {
    title: "NFTs",
    href: "/overview/nfts",
    id: "nfts",
    category: OverviewSubCategory.NFTs,
  },
  {
    title: "History",
    href: "/overview/history",
    id: "history",
    category: OverviewSubCategory.History,
  },
];
