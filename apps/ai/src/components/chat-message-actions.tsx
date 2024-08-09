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

import { IconCheck, IconCopy } from "@/components/icons";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { ButtonIcon } from "@lightdotso/ui";
import { cn } from "@lightdotso/utils";
import type { Message } from "ai";
import type { ComponentProps } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface ChatMessageActionsProps extends ComponentProps<"div"> {
  message: Message;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function ChatMessageActions({
  message,
  className,
  ...props
}: ChatMessageActionsProps) {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 });

  const onCopy = () => {
    if (isCopied) {
      return;
    }
    copyToClipboard(message.content);
  };

  return (
    <div
      className={cn(
        "md:-right-10 md:-top-2 flex items-center justify-end transition-opacity group-hover:opacity-100 md:absolute md:opacity-0",
        className,
      )}
      {...props}
    >
      <ButtonIcon variant="ghost" onClick={onCopy}>
        {isCopied ? <IconCheck /> : <IconCopy />}
        <span className="sr-only">Copy message</span>
      </ButtonIcon>
    </div>
  );
}
