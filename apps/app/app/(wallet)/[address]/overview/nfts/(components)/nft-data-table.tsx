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

"use client";

import { useQueryClient } from "@tanstack/react-query";
import type { FC } from "react";
import type { Address } from "viem";
import { columns } from "@/app/(wallet)/[address]/overview/nfts/(components)/data-table/columns";
import { DataTable } from "@/app/(wallet)/[address]/overview/nfts/(components)/data-table/data-table";
import type { NftDataPage, WalletSettingsData } from "@/data";
import { queries } from "@/queries";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface NftsDataTableProps {
  address: Address;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const NftsDataTable: FC<NftsDataTableProps> = ({ address }) => {
  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const walletSettings: WalletSettingsData | undefined =
    queryClient.getQueryData(queries.wallet.settings(address).queryKey);

  const nftPage: NftDataPage | undefined = queryClient.getQueryData(
    queries.nft.list({
      address,
      is_testnet: walletSettings?.is_enabled_testnet,
    }).queryKey,
  );

  if (!nftPage) {
    return null;
  }

  return <DataTable data={nftPage.nfts ?? []} columns={columns} />;
};
