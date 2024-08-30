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

import type { AI } from "@/ai/client";
import { IconArrowElbow, IconPlus } from "@/components/icons";
import { useEnterSubmit } from "@/hooks/use-enter-submit";
import { ButtonIcon } from "@lightdotso/ui/components/button-icon";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@lightdotso/ui/components/tooltip";
import { useActions, useUIState } from "ai/rsc";
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import Textarea from "react-textarea-autosize";
import { UserMessage } from "./stocks/message";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function PromptForm({
  input,
  setInputAction,
}: {
  input: string;
  setInputAction: (value: string) => void;
}) {
  const router = useRouter();
  const { formRef, onKeyDown } = useEnterSubmit();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { submitUserMessage } = useActions();
  const [_, setMessages] = useUIState<typeof AI>();

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <form
      ref={formRef}
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      onSubmit={async (e: any) => {
        e.preventDefault();

        // Blur focus on mobile
        if (window.innerWidth < 600) {
          e.target.message?.blur();
        }

        const value = input.trim();
        setInputAction("");
        if (!value) {
          return;
        }

        // Optimistically add user message UI
        setMessages((currentMessages) => [
          ...currentMessages,
          {
            id: nanoid(),
            display: <UserMessage>{value}</UserMessage>,
          },
        ]);

        // Submit and get response message
        const responseMessage = await submitUserMessage(value);
        setMessages((currentMessages) => [...currentMessages, responseMessage]);
      }}
    >
      <div className="relative flex max-h-60 w-full grow flex-col overflow-hidden bg-background px-8 sm:rounded-md sm:border sm:px-12">
        <Tooltip>
          <TooltipTrigger asChild>
            <ButtonIcon
              variant="outline"
              className="absolute top-[14px] left-0 rounded-full bg-background p-0 sm:left-4"
              onClick={() => {
                router.push("/new");
              }}
            >
              <IconPlus />
              <span className="sr-only">New Chat</span>
            </ButtonIcon>
          </TooltipTrigger>
          <TooltipContent>New Chat</TooltipContent>
        </Tooltip>
        <Textarea
          ref={inputRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          placeholder="Send a message."
          className="min-h-[60px] w-full resize-none border-0 bg-transparent px-4 py-[1.3rem] focus-within:outline-none focus-visible:ring-0 sm:text-sm"
          autoFocus
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          name="message"
          rows={1}
          value={input}
          onChange={(e: { target: { value: string } }) =>
            setInputAction(e.target.value)
          }
        />
        <div className="absolute top-[13px] right-0 sm:right-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <ButtonIcon type="submit" disabled={input === ""}>
                <IconArrowElbow />
                <span className="sr-only">Send message</span>
              </ButtonIcon>
            </TooltipTrigger>
            <TooltipContent>Send message</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </form>
  );
}
