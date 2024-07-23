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

import type { ImageLoader, ImageProps } from "next/image";
import Image from "next/image";
import { FC } from "react";

// From: https://developers.cloudflare.com/images/transform-images/integrate-with-frameworks/

const normalizeSrc = (src: string) => {
  return src.startsWith("/") ? src.slice(1) : src;
};

export const cloudflareLoader: ImageLoader = ({ src, width, quality }) => {
  const params = [`width=${width}`];
  if (quality) {
    params.push(`quality=${quality}`);
  }
  const paramsString = params.join(",");
  return `/cdn-cgi/image/${paramsString}/${normalizeSrc(src)}`;
};

export const NextImage: FC<ImageProps> = props => {
  return (
    <Image
      {...props}
      loader={
        process.env.VERCEL_ENV === "preview" ||
        process.env.VERCEL_ENV === "production"
          ? cloudflareLoader
          : undefined
      }
    />
  );
};
