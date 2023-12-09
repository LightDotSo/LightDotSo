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

import type { Table } from "@tanstack/react-table";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  TokenData,
  ConfigurationOwnerData,
  NftData,
  WalletData,
} from "@/data";

// -----------------------------------------------------------------------------
// State
// -----------------------------------------------------------------------------

type TablesStore = {
  nftTable: Table<NftData> | null;
  setNftTable: (tableObject: Table<NftData>) => void;
  ownerTable: Table<ConfigurationOwnerData> | null;
  setOwnerTable: (tableObject: Table<ConfigurationOwnerData>) => void;
  tokenTable: Table<TokenData> | null;
  setTokenTable: (tableObject: Table<TokenData>) => void;
  walletTable: Table<WalletData> | null;
  setWalletTable: (tableObject: Table<WalletData>) => void;
};

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useTables = create(
  devtools<TablesStore>(
    set => ({
      nftTable: null,
      setNftTable: tableObject => set({ nftTable: tableObject }),
      ownerTable: null,
      setOwnerTable: tableObject => set({ ownerTable: tableObject }),
      tokenTable: null,
      setTokenTable: tableObject => set({ tokenTable: tableObject }),
      walletTable: null,
      setWalletTable: tableObject => set({ walletTable: tableObject }),
    }),
    {
      anonymousActionType: "useTables",
      name: "TablesStore",
      serialize: {
        options: true,
      },
    },
  ),
);
