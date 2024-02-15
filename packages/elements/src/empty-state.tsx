// Copyright 2023-2024 Light, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { Wallet } from "lucide-react";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type Entity =
  | "wallet"
  | "token"
  | "transaction"
  | "nft"
  | "activity"
  | "owner"
  | "notification";

// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

const entityStateDescription: Record<Entity, string> = {
  activity: "activity",
  wallet: "wallets",
  token: "tokens",
  transaction: "transactions",
  nft: "NFTs",
  owner: "owners",
  notification: "Notifications",
};

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface EmptyStateProps {
  entity: Entity;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const EmptyState: FC<EmptyStateProps> = ({ entity }) => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="mt-3 space-y-3">
      <span className="inline-flex rounded-full border-2 border-border p-4">
        <Wallet className="mx-auto size-10 text-lg text-border" />
      </span>
      <div className="text-text-weaker">
        No {entityStateDescription[entity]} in wallet.
      </div>
    </div>
  );
};
