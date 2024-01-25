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
    <div className="flex items-center space-x-3">
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
    </div>
  );
};
