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

import { Wallet } from "lucide-react";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type Entity = "wallet" | "token" | "transaction" | "nft";

// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

const entityDescription: Record<Entity, string> = {
  wallet: "wallets",
  token: "tokens",
  transaction: "transactions",
  nft: "NFTs",
};

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface TableEmptyProps {
  entity: Entity;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const TableEmpty: FC<TableEmptyProps> = ({ entity }) => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="mt-3 space-y-3">
      <span className="inline-flex rounded-full border-2 border-border p-4">
        <Wallet className="mx-auto h-10 w-10 text-lg text-border" />
      </span>
      <div className="text-text-weaker">
        No {entityDescription[entity]} in wallet.
      </div>
    </div>
  );
};
