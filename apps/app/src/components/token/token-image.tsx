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
import { cn } from "@lightdotso/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { useState, type FC, useEffect } from "react";
import type { TokenData } from "@/data";
import { shortenName } from "@/utils";

// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

export const parseTokenAddress = (token: TokenData) => {
  if (
    token.chain_id == 137 &&
    token.address == "0x0000000000000000000000000000000000000000"
  ) {
    return [1, "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0"];
  }

  if (token.address == "0x0000000000000000000000000000000000000000") {
    return [1, "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"];
  }

  return [token.chain_id, token.address.toLowerCase()];
};

// -----------------------------------------------------------------------------
// Cva
// -----------------------------------------------------------------------------

const tokenImageVariants = cva("inline-flex overflow-hidden rounded-full", {
  variants: {
    size: {
      xs: "h-6 w-6",
      sm: "h-8 w-8",
      md: "h-12 w-12",
      lg: "h-16 w-16",
      xl: "h-24 w-24",
    },
  },
  defaultVariants: {
    size: "sm",
  },
});

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type TokenImageProps = {
  token: TokenData;
  size?: VariantProps<typeof tokenImageVariants>["size"];
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const TokenImage: FC<TokenImageProps> = ({ token, size }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isImageError, setIsImageError] = useState(false);
  const [tokenChainId, tokenAddress] = parseTokenAddress(token);

  const className = tokenImageVariants({ size });
  const imageSrc = `https://logos.covalenthq.com/tokens/${tokenChainId}/${tokenAddress}.png`;

  useEffect(() => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => setIsImageLoaded(true);
    image.onerror = () => setIsImageError(true);
  }, [imageSrc]);

  if (!isImageLoaded) {
    return <Skeleton className={className} />;
  }

  if (isImageLoaded && !isImageError) {
    return (
      <img
        className={className}
        src={imageSrc}
        alt={token.name ?? token.symbol}
        onLoad={() => setIsImageLoaded(true)}
        onErrorCapture={() => setIsImageError(true)}
      />
    );
  }

  return (
    <span
      className={cn(
        className,
        "mr-1.5 items-center justify-center text-ellipsis border border-border-primary-weak bg-background-stronger text-xs leading-none text-text-weak",
      )}
    >
      {shortenName(token.name ?? token.symbol)}
    </span>
  );
};
