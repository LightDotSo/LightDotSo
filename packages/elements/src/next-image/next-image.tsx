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

import { INTERNAL_LINKS } from "@lightdotso/const";
import type { ImageLoader, ImageProps } from "next/image";
import Image from "next/image";
import {
  type FC,
  type SyntheticEvent,
  useCallback,
  useMemo,
  useState,
} from "react";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

// From: https://zenn.dev/naporin24690/scraps/1bc717da44e1d6
// Also: https://github.com/napolab/cloudflare-next-image-demo

export const NextImage: FC<ImageProps> = (props) => {
  // ---------------------------------------------------------------------------
  // Utils
  // ---------------------------------------------------------------------------

  // From: https://developers.cloudflare.com/images/transform-images/integrate-with-frameworks/
  const normalizeSrc = (src: string) => {
    return src.startsWith("/") ? src.slice(1) : src;
  };

  // ---------------------------------------------------------------------------
  // Loader
  // ---------------------------------------------------------------------------

  const cloudflareLoader: ImageLoader = ({ src, width, quality }) => {
    const params = [`width=${width}`];
    if (quality) {
      params.push(`quality=${quality}`);
    }
    const paramsString = params.join(",");
    return `https://light.so/cdn-cgi/image/${paramsString}/${normalizeSrc(src)}`;
  };

  // ---------------------------------------------------------------------------
  // Utils
  // ---------------------------------------------------------------------------

  const blurDataUrl = (path: string) => {
    const searchParams = new URLSearchParams();
    // biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
    searchParams.set("width", `64`);
    // biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
    searchParams.set("quality", `30`);
    // biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
    searchParams.set("blur", `12`);

    if (path.startsWith("https://")) {
      searchParams.set("url", path);

      return `${INTERNAL_LINKS.Images}/_next/image?${searchParams.toString()}`;
    }

    return `${path}?${searchParams.toString()}`;
  };

  // ---------------------------------------------------------------------------
  // State Hooks
  // ---------------------------------------------------------------------------

  const [loading, setLoading] = useState(true);
  const handleLoad = useCallback(
    (event: SyntheticEvent<HTMLImageElement, Event>) => {
      setLoading(false);
      props?.onLoad?.(event);
    },
    [props],
  );

  // Make sure the placeholder is blurred by default if not set explicitly
  const isPlaceholderBlur =
    typeof props.src === "string" &&
    (props.placeholder === "blur" || props.placeholder === undefined);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const style = useMemo(
    () =>
      typeof props.src === "string" &&
      (props.placeholder === "blur" || props.placeholder === undefined)
        ? {
            ...props.style,
            backgroundImage: `url(${blurDataUrl(props.src)})`,
            backgroundSize: "cover",
            backgroundPosition: props.style?.objectPosition ?? "50% 50%",
            backgroundRepeat: "no-repeat",
          }
        : {},
    [props.placeholder, props.src, props.style],
  );

  if (
    typeof props.src === "string" &&
    (props.src as string).startsWith(INTERNAL_LINKS.Assets) &&
    (process.env.NODE_ENV === "development" ||
      process.env.NEXT_PUBLIC_VERCEL_ENV === "production")
  ) {
    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------

    return (
      <Image
        {...props}
        placeholder="empty"
        onLoad={handleLoad}
        alt={props.alt}
        style={isPlaceholderBlur && loading ? style : props.style}
        loader={
          process.env.NEXT_PUBLIC_VERCEL_ENV ? cloudflareLoader : undefined
        }
      />
    );
  }

  // biome-ignore lint/a11y/useAltText: <explanation>
  return <img {...props} src={props.src as string} />;
};
