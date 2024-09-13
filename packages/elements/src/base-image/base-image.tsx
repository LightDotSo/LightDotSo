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

import { cn } from "@lightdotso/utils";
import type { ImageProps } from "next/image";
import { type FC, createContext, useContext, useEffect, useState } from "react";
import { NextImage } from "../next-image";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type BaseImageProps = ImageProps;

// -----------------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------------

const BaseImageContext = createContext<boolean>(false);

export const useBaseImageLoaded = () => useContext(BaseImageContext);

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const BaseImage: FC<BaseImageProps> = ({
  className,
  src,
  alt,
  ...props
}) => {
  // ---------------------------------------------------------------------------
  // State Hooks
  // ---------------------------------------------------------------------------

  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    // Set a timeout to force the image to be considered as loaded after 3 seconds
    const timeoutId = setTimeout(() => {
      if (!isImageLoaded) {
        setIsImageLoaded(true);
      }
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [isImageLoaded]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <BaseImageContext.Provider value={isImageLoaded}>
      <NextImage
        className={cn(
          "absolute inset-0 w-full duration-500 ease-in-out",
          !isImageLoaded && "animate-pulse bg-emphasis-medium",
          isImageLoaded
            ? "scale-100 blur-0 grayscale-0 group-hover:scale-125 group-hover:blur-2 group-hover:grayscale-0"
            : "scale-90 blur-xl",
          className,
        )}
        src={src}
        alt={alt}
        onLoad={() => setIsImageLoaded(true)}
        onError={() => setIsImageLoaded(true)}
        {...props}
      />
    </BaseImageContext.Provider>
  );
};
