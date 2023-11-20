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

import { Modal } from "@/components/modal";
import { OpDialog } from "@/app/(wallet)/[address]/op/(components)/op-dialog";
import { preloader } from "@/preloaders/paths/[address]/preloader";
import { preloader as userOpPreloader } from "@/preloaders/paths/[address]/transaction/[chainId]/[userOperationHash]/preloader";
import { handler } from "@/handlers/paths/[address]/handler";
import { handler as userOpHandler } from "@/handlers/paths/[address]/transaction/[chainId]/[userOperationHash]/handler";
import type { Address } from "viem";
import { parseNumber } from "@/handlers/parsers";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type PageProps = {
  params: { address: string; chainId: string; userOperationHash: string };
};

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default async function Page({ params }: PageProps) {
  // ---------------------------------------------------------------------------
  // Preloaders
  // ---------------------------------------------------------------------------

  preloader(params);
  userOpPreloader(params);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const { config } = await handler(params);
  const { userOperation } = await userOpHandler(params);
  const chainId = parseNumber(params.chainId);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Modal>
      <OpDialog
        config={config}
        address={params.address as Address}
        chainId={chainId}
        userOperation={userOperation}
      ></OpDialog>
    </Modal>
  );
}
