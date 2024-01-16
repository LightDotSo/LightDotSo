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

/* eslint-disable @next/next/no-img-element */

import type { NftData } from "@lightdotso/data";
import { cn } from "@lightdotso/utils";
import { useState, type FC } from "react";
import { Blurhash } from "react-blurhash";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type NftImageProps = {
  className?: string;
  nft: NftData;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const NftImage: FC<NftImageProps> = ({
  className,
  nft: {
    contract_address,
    image_url,
    collection: { description },
    previews: { blurhash, image_large_url },
    extra_metadata,
  },
}) => {
  // ---------------------------------------------------------------------------
  // State Hooks
  // ---------------------------------------------------------------------------

  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      className={cn(
        "aspect-h-1 aspect-w-1 relative w-full overflow-hidden bg-background",
        className,
      )}
    >
      {!isImageLoaded && blurhash && (
        <div className="absolute inset-0 h-full w-full">
          <Blurhash width="100%" height="100%" hash={blurhash} />
        </div>
      )}
      <img
        className={cn(
          "absolute inset-0 w-full duration-500 ease-in-out",
          !isImageLoaded && "bg-emphasis-medium animate-pulse",
          !isImageLoaded
            ? "scale-90 blur-xl"
            : "group-hover:blur-2 scale-100 blur-0 grayscale-0 group-hover:scale-125 group-hover:grayscale-0",
        )}
        src={
          // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
          image_url ?? image_large_url ?? extra_metadata?.image_original_url!
        }
        alt={description ?? contract_address!}
        onLoad={() => setIsImageLoaded(true)}
      />
    </div>
  );
};
