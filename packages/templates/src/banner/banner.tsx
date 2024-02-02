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

import { useBanners } from "@lightdotso/stores";
import type { Banner as BannerKind } from "@lightdotso/types";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { type FC } from "react";
import { GamepadIcon } from "lucide-react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export type BannerProps = {
  kind: BannerKind;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const Banner: FC<BannerProps> = ({ kind }) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { isBetaClosed, toggleIsBetaClosed } = useBanners();

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (kind === "beta" && isBetaClosed) {
    return null;
  }

  return (
    <div className="flex items-center gap-x-6 bg-background-purple-weakest px-6 py-2.5 sm:px-3.5 sm:before:flex-1">
      <p className="text-sm leading-6 text-text">
        {kind === "demo" && (
          <GamepadIcon
            className="mx-2 inline size-0.5 fill-current"
            aria-hidden="true"
          />
        )}
        {kind === "demo" && "Demo"}
        {kind === "beta" && "Beta"}
        <span aria-hidden="true">&rarr;</span>
      </p>
      <div className="flex flex-1 justify-end">
        {kind === "beta" && (
          <button
            type="button"
            className="-m-3 p-3 focus-visible:outline-offset-[-4px]"
            onClick={toggleIsBetaClosed}
          >
            <span className="sr-only">Dismiss</span>
            <XMarkIcon className="size-5 text-text" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
};
