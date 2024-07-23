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
