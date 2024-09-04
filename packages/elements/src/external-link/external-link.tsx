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

import { cn } from "@lightdotso/utils";
import { ArrowUpRightFromSquareIcon } from "lucide-react";
import type { ComponentProps, FC } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export type ExternalLinkProps = ComponentProps<"a"> & {
  noIcon?: boolean;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const ExternalLink: FC<ExternalLinkProps> = ({
  href,
  children,
  className,
  noIcon = false,
  ...props
}) => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex flex-1 justify-center gap-0.5 break-all text-text-info leading-4 hover:text-text-info-strong",
        className,
      )}
      {...props}
    >
      {children ?? href}
      {!noIcon && <ArrowUpRightFromSquareIcon className="h-2 w-2 shrink-0" />}
    </a>
  );
};
