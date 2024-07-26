// Copyright 2023-2024 LightDotSo.
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

import { cn } from "@lightdotso/utils";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
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
// Cva
// -----------------------------------------------------------------------------

const emptyStateVariants = cva([], {
  variants: {
    size: {
      xl: "size-16",
      lg: "size-12",
      default: "size-10",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

const emptyStateTextVariants = cva([], {
  variants: {
    size: {
      xl: "text-lg",
      lg: "text-md",
      default: "text-md",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface EmptyStateProps extends VariantProps<typeof emptyStateVariants> {
  entity: Entity;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const EmptyState: FC<EmptyStateProps> = ({ entity, size }) => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="mt-3 space-y-3">
      <span className="inline-flex rounded-full border-2 border-border p-4">
        <Wallet
          className={cn(
            "mx-auto text-border text-lg",
            emptyStateVariants({ size: size }),
          )}
        />
      </span>
      <div
        className={cn(
          "text-text-weaker",
          emptyStateTextVariants({ size: size }),
        )}
      >
        No {entityStateDescription[entity]} in wallet.
      </div>
    </div>
  );
};
