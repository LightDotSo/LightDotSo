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

import { ModalInterception } from "@lightdotso/templates";
import type { Address } from "viem";
import { ModalInterceptionFooter } from "@/app/(wallet)/@op/(.)[address]/op/(components)/modal-interception-footer";
import OriginalPage from "@/app/(wallet)/[address]/op/page";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type PageProps = {
  params: { address: string };
  searchParams: {
    userOperations?: string;
  };
};

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default async function Page({ params, searchParams }: PageProps) {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <ModalInterception
      footerContent={
        <ModalInterceptionFooter address={params.address as Address} />
      }
      type="op"
    >
      <OriginalPage params={params} searchParams={searchParams} />
    </ModalInterception>
  );
}

// -----------------------------------------------------------------------------
// Config
// -----------------------------------------------------------------------------

export const runtime = "edge";
