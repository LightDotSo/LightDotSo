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

import { Skeleton } from "@lightdotso/ui";
import { useState, type FC, useEffect } from "react";

// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

export const shortenName = (name: string) => {
  return name.match(/\b\w/g)?.join("").substring(0, 3);
};

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type TokenImageProps = {
  address: string;
  chain_id: number;
  name?: string | null;
  symbol: string;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const TokenImage: FC<TokenImageProps> = ({
  address,
  chain_id,
  name,
  symbol,
}) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isImageError, setIsImageError] = useState(false);

  const imageSrc = `https://logos.covalenthq.com/tokens/${chain_id}/${address.toLowerCase()}.png`;

  useEffect(() => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => setIsImageLoaded(true);
    image.onerror = () => setIsImageError(true);
  }, [imageSrc]);

  if (!isImageLoaded) {
    return <Skeleton className="h-10 w-10 rounded-full" />;
  }

  if (isImageLoaded && !isImageError) {
    return (
      <img
        className="inline-flex h-10 w-10 rounded-full"
        src={imageSrc}
        alt={name ?? symbol}
        onLoad={() => setIsImageLoaded(true)}
        onErrorCapture={() => setIsImageError(true)}
      />
    );
  }

  return (
    <span className="mr-1.5 inline-flex h-10 w-10 items-center justify-center overflow-hidden text-ellipsis rounded-full border border-border-primary-weak bg-background-stronger text-xs leading-none text-text-weak">
      {shortenName(name ?? symbol)}
    </span>
  );
};
