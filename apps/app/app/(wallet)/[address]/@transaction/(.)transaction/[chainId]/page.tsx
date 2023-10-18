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
import { TransactionDialog } from "@/components/transaction-dialog";
import { handler } from "@/handles/transaction/[chainId]";
import { parseNumber } from "@/handles/parsers/number";

export default async function Page({
  params,
  searchParams,
}: {
  params: { address: string; chainId: string };
  searchParams: {
    initCode?: string;
    callData?: string;
  };
}) {
  let { userOperation, hash } = await handler(params, searchParams);
  const chainId = parseNumber(params.chainId);

  return (
    <Modal>
      <TransactionDialog
        chainId={chainId}
        userOpHash={hash}
        userOperation={userOperation}
      ></TransactionDialog>
    </Modal>
  );
}
