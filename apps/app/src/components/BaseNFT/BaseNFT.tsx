import type { OpenseaAsset } from "@lightdotso/types";
import Script from "next/script";
import type { FC } from "react";

export type BaseNFTProps = { asset: OpenseaAsset };

import { NextImage } from "@lightdotso/app/components/NextImage";

export const BaseNFT: FC<BaseNFTProps> = ({
  asset: {
    animation_original_url,
    animation_url,
    image_original_url,
    image_url,
    name,
  },
}) => {
  if (
    animation_original_url?.endsWith(".glb") ||
    animation_url?.endsWith(".glb")
  ) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Script
          type="module"
          src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"
        />
        {/* @ts-ignore */}
        <model-viewer
          auto-rotate
          camera-controls
          className="h-full w-full"
          src={animation_url ?? animation_original_url}
        />
      </div>
    );
  }

  if (
    animation_original_url?.endsWith(".mp3") ||
    animation_original_url?.endsWith(".wav") ||
    animation_url?.endsWith(".mp3") ||
    animation_url?.endsWith(".wav")
  ) {
    return (
      <div>
        <NextImage
          layout="fill"
          className="object-contain"
          src={image_url ?? image_original_url}
          alt={name}
          loading="lazy"
        />
        <audio
          controls
          loop
          autoPlay
          muted
          className="absolute bottom-0 w-full"
          src={animation_url ?? animation_original_url}
        />
      </div>
    );
  }

  if (
    animation_url?.endsWith(".mp4") ||
    animation_original_url?.endsWith(".mp4") ||
    animation_url?.endsWith(".mov") ||
    animation_original_url?.endsWith(".mov")
  ) {
    return (
      <div className="flex h-full w-full">
        <video
          controls
          loop
          autoPlay
          muted
          src={animation_url ?? animation_original_url}
        />
      </div>
    );
  }

  if (animation_url) {
    return (
      <div className="flex h-full w-full">
        <iframe
          className="w-full"
          title={name}
          src={animation_url ?? animation_original_url}
        />
      </div>
    );
  }

  if (image_original_url?.endsWith(".webm")) {
    return (
      <div className="flex h-full w-full">
        <video controls autoPlay loop muted>
          <source src={image_url ?? image_original_url} type="video/webm" />
        </video>
      </div>
    );
  }

  if (image_url) {
    return (
      <NextImage
        layout="fill"
        className="h-full w-full object-cover"
        src={image_url ?? image_original_url}
        alt={name}
        loading="lazy"
      />
    );
  }

  if (!name) {
    return (
      <div className="flex h-full animate-pulse items-center justify-center bg-emphasis-high duration-[3000ms]">
        <h1 className="text-center text-xl font-semibold text-contrast-medium">
          Unknown
        </h1>
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center">
      <h1 className="text-center text-xl font-semibold text-contrast-medium">
        {name}
      </h1>
    </div>
  );
};
