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

import OriginalPage from "@/app/(wallet)/[address]/activity/page";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface PageProps {
  searchParams: {
    pagination?: string;
  };
}

// -----------------------------------------------------------------------------
// Original Page
// -----------------------------------------------------------------------------

export default async function Page({ searchParams }: PageProps) {
  return OriginalPage({
    params: { address: "0xFbd80Fe5cE1ECe895845Fd131bd621e2B6A1345F" },
    searchParams,
  });
}
