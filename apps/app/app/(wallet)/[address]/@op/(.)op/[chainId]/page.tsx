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
import { TransactionDialog } from "@/app/(wallet)/[address]/transactions/(components)/transaction/transaction-dialog";
import { preloader } from "@/preloaders/paths/[address]/preloader";
import { preloader as userOpPreloader } from "@/preloaders/paths/[address]/transaction/[chainId]/preloader";
import { handler } from "@/handlers/paths/[address]/handler";
import { handler as userOpHandler } from "@/handlers/paths/[address]/transaction/[chainId]/handler";
import { parseNumber } from "@/handlers/parsers";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type PageProps = {
  params: { address: string; chainId: string };
  searchParams: {
    initCode?: string;
    callData?: string;
  };
};

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default async function Page({ params, searchParams }: PageProps) {
  // ---------------------------------------------------------------------------
  // Preloaders
  // ---------------------------------------------------------------------------

  preloader(params);
  userOpPreloader(params, searchParams);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const { config } = await handler(params);
  const { userOperation, hash } = await userOpHandler(params, searchParams);
  const chainId = parseNumber(params.chainId);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Modal>
      <TransactionDialog
        owners={config.owners}
        address={params.address as Address}
        chainId={chainId}
        userOpHash={hash}
        userOperation={userOperation}
      ></TransactionDialog>
    </Modal>
  );
}
