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

// import { INTERNAL_LINKS } from "@lightdotso/const";
import type { ImageProps } from "next/image";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const NextImage: FC<ImageProps> = (props) => {
  // ---------------------------------------------------------------------------
  // Utils
  // ---------------------------------------------------------------------------

  // From: https://developers.cloudflare.com/images/transform-images/integrate-with-frameworks/
  // const normalizeSrc = (src: string) => {
  //   return src.startsWith("/") ? src.slice(1) : src;
  // };

  // ---------------------------------------------------------------------------
  // Loader
  // ---------------------------------------------------------------------------

  // const cloudflareLoader: ImageLoader = ({ src, width, quality }) => {
  //   const params = [`width=${width}`];
  //   if (quality) {
  //     params.push(`quality=${quality}`);
  //   }
  //   const paramsString = params.join(",");
  //   return `/cdn-cgi/image/${paramsString}/${normalizeSrc(src)}`;
  // };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  // if (
  //   typeof props.src === "string" &&
  //   (props.src as string).startsWith(INTERNAL_LINKS.Assets) &&
  //   process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
  // )
  //   return (
  //     <Image
  //       {...props}
  //       src={cloudflareLoader({
  //         src: props.src as string,
  //         width: typeof props.width === "number" ? props.width : 100,
  //       })}
  //     />
  //   );

  // biome-ignore lint/a11y/useAltText: <explanation>
  return <img {...props} src={props.src as string} />;
};
