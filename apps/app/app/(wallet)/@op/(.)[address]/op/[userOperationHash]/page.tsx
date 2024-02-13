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
import { ModalInterceptionFooter } from "@/app/(wallet)/@op/(.)[address]/op/(components)/modal-interception-footer";
import OriginalPage from "@/app/(wallet)/[address]/op/[userOperationHash]/page";
import { handler } from "@/handlers/paths/[address]/op/[userOperationHash]/handler";
import type { Address, Hex } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type PageProps = {
  params: { address: string; userOperationHash: string };
};

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default async function Page({ params }: PageProps) {
  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  await handler(params);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <ModalInterception
      footerContent={
        <ModalInterceptionFooter
          address={params.address as Address}
          userOperationHash={params.userOperationHash as Hex}
        />
      }
      type="op"
    >
      <OriginalPage params={params} />
    </ModalInterception>
  );
}

// -----------------------------------------------------------------------------
// Config
// -----------------------------------------------------------------------------

// export const runtime = "edge";
