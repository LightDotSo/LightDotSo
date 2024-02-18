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

"use client";

import { ChainLogo } from "@lightdotso/svg";
import { cn, getChainById } from "@lightdotso/utils";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type ChainCardProps = { chain_id: number; className?: string };

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const ChainCard: FC<ChainCardProps> = ({ chain_id, className }) => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (chain_id === 0) {
    return <div className={cn("w-32 min-w-20 shrink", className)} />;
  }

  return (
    <div className={cn("w-32 min-w-20 shrink", className)}>
      <div className="flex items-center justify-start space-x-1.5">
        <ChainLogo className="size-6" chainId={chain_id} />
        <span className="text-xs font-medium text-text md:text-sm">
          {getChainById(chain_id).name}
        </span>
      </div>
    </div>
  );
};
