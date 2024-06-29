// Copyright 2023-2024 Light
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

import type { InterpretationData } from "@lightdotso/data";
import { AssetChange } from "@lightdotso/elements";
import { cn } from "@lightdotso/utils";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type InterpretationCardProps = {
  interpretation?: InterpretationData | null;
  className?: string;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const InterpretationCard: FC<InterpretationCardProps> = ({
  interpretation,
  className,
}) => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (!interpretation) {
    return <div className={cn("min-w-32 grow", className)} />;
  }

  return (
    <div
      className={cn(
        "flex min-w-32 grow items-center space-x-2 md:space-x-3",
        className,
      )}
    >
      {interpretation?.asset_changes &&
        interpretation.asset_changes
          .slice(0, 1)
          .map((assetChange, index) => (
            <AssetChange key={index} assetChange={assetChange} />
          ))}
    </div>
  );
};
