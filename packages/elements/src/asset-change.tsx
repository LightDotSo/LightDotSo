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

import type { AssetChangeData } from "@lightdotso/data";
import { refineNumberFormat } from "@lightdotso/utils";
import type { FC } from "react";
import { TokenImage } from "./token-image";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export interface AssetChangeProps {
  assetChange: AssetChangeData;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const AssetChange: FC<AssetChangeProps> = ({ assetChange }) => {
  return (
    <>
      {assetChange?.token && assetChange?.token?.decimals !== 0 && (
        <TokenImage size="xs" token={assetChange.token} />
      )}
      {assetChange?.token && assetChange?.token?.decimals !== 0 && (
        <span className="text-xs text-text md:text-sm">
          {assetChange?.token.name ?? assetChange?.token.symbol}{" "}
          {
            <span className="text-xs text-text-weak">
              (
              {refineNumberFormat(
                assetChange?.amount / 10 ** assetChange?.token.decimals,
              )}{" "}
              {assetChange?.token.symbol})
            </span>
          }
        </span>
      )}
    </>
  );
};
