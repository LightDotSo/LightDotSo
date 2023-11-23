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

// import type { Address } from "viem";
// import { TransactionDialog } from "@/app/(wallet)/[address]/send/(components)/op-confirm-dialog";
import { Modal } from "@/components/modal";
// import { parseNumber } from "@/handlers/parsers";
// import { handler } from "@/handlers/paths/[address]/handler";
// import { handler as userOpHandler } from "@/handlers/paths/[address]/transaction/[chainId]/handler";
import { preloader as userOpPreloader } from "@/preloaders/paths/[address]/op/[chainId]/preloader";
import { preloader } from "@/preloaders/paths/[address]/preloader";

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
  // Preloaders
  // ---------------------------------------------------------------------------

  preloader(params);
  userOpPreloader(params, searchParams);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  // const { config } = await handler(params);
  // const { userOperation, hash } = await userOpHandler(params, searchParams);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Modal>
      {/* <TransactionDialog
        owners={config.owners}
        address={params.address as Address}
        chainId={chainId}
        userOpHash={hash}
        userOperation={userOperation}
      /> */}
    </Modal>
  );
}
