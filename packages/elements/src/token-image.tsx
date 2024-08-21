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

"use client";

/* eslint-disable @next/next/no-img-element */

import type { TokenData } from "@lightdotso/data";
import { ChainLogo } from "@lightdotso/svg";
import { Skeleton } from "@lightdotso/ui";
import { cn, shortenName } from "@lightdotso/utils";
import { getChainLabelById } from "@lightdotso/utils/src/chain";
import { type VariantProps, cva } from "class-variance-authority";
import { type FC, memo, useEffect, useMemo, useState } from "react";
import { NextImage } from "./next-image";

// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

export const parseTokenAddress = (token: TokenData) => {
  if (
    token.chain_id === 137 &&
    token.address === "0x0000000000000000000000000000000000000000"
  ) {
    return [1, "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0"];
  }

  if (token.address === "0x0000000000000000000000000000000000000000") {
    return [1, "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"];
  }

  return [token.chain_id, token.address.toLowerCase()];
};

// -----------------------------------------------------------------------------
// Cva
// -----------------------------------------------------------------------------

const tokenImageBaseVariants = cva(
  "inline-flex shrink-0 overflow-hidden rounded-full",
  {
    variants: {
      size: {
        default: "size-6 md:size-8",
        xs: "size-6",
        sm: "size-8",
        md: "size-12",
        lg: "size-16",
        xl: "size-24",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type TokenImageProps = TokenImageBaseProps & {
  withChainLogo?: boolean;
};

type TokenImageBaseProps = {
  className?: string;
  isLoading?: boolean;
  token: TokenData;
  size?: VariantProps<typeof tokenImageBaseVariants>["size"];
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const BaseTokenImage: FC<TokenImageProps> = ({
  className,
  isLoading,
  token,
  size,
  withChainLogo,
}) => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (withChainLogo) {
    return (
      <div className={cn("relative inline-block shrink-0", className)}>
        <TokenImageBase
          className="flex items-center justify-center text-ellipsis border border-border-primary-weak bg-background-stronger text-text-weak text-xs leading-none"
          isLoading={isLoading}
          token={token}
          size={size}
        />
        {withChainLogo && (
          <span className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4">
            <ChainLogo chainId={token.chain_id} size="sm" />
          </span>
        )}
      </div>
    );
  }

  return (
    <TokenImageBase
      className={cn(tokenImageBaseVariants({ size: size }), className)}
      isLoading={isLoading}
      token={token}
      size={size}
    />
  );
};

export const TokenImageBase: FC<TokenImageBaseProps> = ({
  className,
  isLoading,
  token,
  size,
}) => {
  // ---------------------------------------------------------------------------
  // State Hooks
  // ---------------------------------------------------------------------------

  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isImageError, setIsImageError] = useState(false);
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [tokenChainId, tokenAddress] = parseTokenAddress(token);

  // ---------------------------------------------------------------------------
  // Local Variables
  // ---------------------------------------------------------------------------

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const urls = useMemo(
    () =>
      [
        `https://assets.smold.app/api/token/${tokenChainId}/${tokenAddress}/logo.svg`,
        `https://logos.covalenthq.com/tokens/${tokenChainId}/${tokenAddress}.png`,
        `https://raw.githubusercontent.com/sushiswap/assets/master/blockchains/${getChainLabelById(token.chain_id)}/assets/${token.address.toLowerCase()}/logo.png`,
        `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${getChainLabelById(token.chain_id)}/assets/${token.address.toLowerCase()}/logo.png`,
        typeof token.symbol === "string" && token.symbol
          ? `https://raw.githubusercontent.com/0xa3k5/web3icons/main/packages/core/src/svgs/tokens/branded/${token.symbol.toUpperCase()}.svg`
          : null,
      ].filter((url) => url !== null) as string[],
    [tokenChainId, tokenAddress, token.symbol],
  );

  const currentUrl = useMemo(() => {
    if (token?.logo_url) {
      return token.logo_url;
    }

    return urls[currentUrlIndex];
  }, [token, currentUrlIndex, urls]);

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const img = new Image();
    img.src = currentUrl;
    img.onload = () => setIsImageLoaded(true);
    img.onerror = () => {
      if (currentUrlIndex < urls.length - 1) {
        setCurrentUrlIndex((prevUrlIndex) => prevUrlIndex + 1);
        setIsImageLoaded(false);
      } else {
        setIsImageLoaded(true);
        setIsImageError(true);
      }
    };
  }, [currentUrl, currentUrlIndex, urls.length]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (
    !isImageLoaded ||
    isLoading ||
    typeof token.symbol === "undefined" ||
    token.symbol === null
  ) {
    return (
      <Skeleton
        as="span"
        className={cn(
          "items-center justify-center border border-border-primary-weak",
          tokenImageBaseVariants({ size: size }),
          className,
        )}
      >
        &nbsp;&nbsp;
      </Skeleton>
    );
  }

  if (isImageLoaded && !isImageError) {
    return (
      <span
        className={cn(
          "relative inline-flex items-center justify-center text-ellipsis border border-border-primary-weak bg-background-stronger text-text-weak text-xs leading-none",
          tokenImageBaseVariants({ size: size }),
          className,
        )}
      >
        <NextImage
          className="size-full object-cover"
          src={currentUrl}
          alt={token.name ?? token.symbol}
          onLoad={() => setIsImageLoaded(true)}
          onErrorCapture={() => setIsImageError(true)}
        />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "relative inline-flex items-center justify-center text-ellipsis border border-border-primary-weak bg-background-stronger text-text-weak text-xs leading-none",
        tokenImageBaseVariants({ size: size }),
        className,
      )}
    >
      {shortenName(token.name ?? token.symbol)}
    </span>
  );
};

// -----------------------------------------------------------------------------
// Memo
// -----------------------------------------------------------------------------

export const TokenImage = memo(BaseTokenImage);
