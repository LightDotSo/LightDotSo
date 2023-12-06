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

/* eslint-disable @next/next/no-img-element */

import { cn } from "@lightdotso/utils";
import { useState, type FC } from "react";
import { Blurhash } from "react-blurhash";
import type { NftData } from "@/data";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type NftImageProps = {
  nft: NftData;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const NftImage: FC<NftImageProps> = ({
  nft: {
    contract_address,
    image_url,
    collection: { description },
    previews: { blurhash, image_large_url },
    extra_metadata,
  },
}) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  return (
    <div
      className={cn(
        "grayscale duration-500 ease-in-out relative aspect-w-1 aspect-h-1 bg-background",
        !isImageLoaded && "animate-pulse bg-emphasis-medium",
        !isImageLoaded
          ? "scale-90 blur-xl grayscale"
          : "scale-100 blur-0 grayscale-0 group-hover:scale-125 group-hover:blur-2 group-hover:grayscale-0",
      )}
      style={{ aspectRatio: "1" }}
    >
      {!isImageLoaded && blurhash && (
        <div className="absolute inset-0">
          <Blurhash hash={blurhash} />
        </div>
      )}
      <img
        className="absolute inset-0 w-full"
        src={
          image_url ?? image_large_url ?? extra_metadata?.image_original_url!
        }
        alt={description ?? contract_address!}
        onLoad={() => setIsImageLoaded(true)}
      />
    </div>
  );
};
