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

// Copyright 2023-2024 Vercel, Inc.
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

import { IconArrowDown } from "@/components/icons";
import {
  ButtonIcon,
  type ButtonIconProps,
} from "@lightdotso/ui/components/button-icon";
import { cn } from "@lightdotso/utils";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface ButtonScrollToBottomProps extends ButtonIconProps {
  isAtBottom: boolean;
  scrollToBottomAction: () => void;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function ButtonScrollToBottom({
  className,
  isAtBottom,
  scrollToBottomAction,
  ...props
}: ButtonScrollToBottomProps) {
  return (
    <ButtonIcon
      variant="outline"
      className={cn(
        "absolute top-1 right-4 z-10 bg-background transition-opacity duration-300 sm:right-8 md:top-2",
        isAtBottom ? "opacity-0" : "opacity-100",
        className,
      )}
      onClick={() => scrollToBottomAction()}
      {...props}
    >
      <IconArrowDown />
      <span className="sr-only">Scroll to bottom</span>
    </ButtonIcon>
  );
}
