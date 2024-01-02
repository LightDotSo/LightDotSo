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

import type { Address } from "viem";
import { SendDialog } from "@/app/(wallet)/[address]/send/(components)/send-dialog";
import { Modal } from "@/components/modal";
import { handler } from "@/handlers/paths/[address]/send/handler";
import { preloader } from "@/preloaders/paths/[address]/send/preloader";
import { queryKeys } from "@/queryKeys";
import { getQueryClient } from "@/services";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type PageProps = {
  params: { address: string };
  searchParams: {
    transfers?: string;
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

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const { transfers, tokens, nfts, walletSettings } = await handler(
    params,
    searchParams,
  );

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = getQueryClient();

  queryClient.setQueryData(
    queryKeys.wallet.settings({ address: params.address as Address }).queryKey,
    walletSettings,
  );
  queryClient.setQueryData(
    queryKeys.token.list({
      address: params.address as Address,
      limit: Number.MAX_SAFE_INTEGER,
      offset: 0,
      is_testnet: walletSettings?.is_enabled_testnet,
      group: false,
      chain_ids: null,
    }).queryKey,
    tokens,
  );
  queryClient.setQueryData(
    queryKeys.nft.list({
      address: params.address as Address,
      is_testnet: walletSettings?.is_enabled_testnet,
      limit: Number.MAX_SAFE_INTEGER,
    }).queryKey,
    nfts,
  );
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Modal>
      <SendDialog
        address={params.address as Address}
        initialTransfers={transfers ?? []}
      />
    </Modal>
  );
}
