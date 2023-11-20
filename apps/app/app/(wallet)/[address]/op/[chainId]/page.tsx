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

import { TransactionDialog } from "@/components/transaction-dialog";
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
  const { config } = await handler(params);
  const { userOperation, hash } = await userOpHandler(params, searchParams);
  const chainId = parseNumber(params.chainId);

  return (
    <TransactionDialog
      owners={config.owners}
      address={params.address as Address}
      chainId={chainId}
      userOpHash={hash}
      userOperation={userOperation}
    ></TransactionDialog>
  );
}
