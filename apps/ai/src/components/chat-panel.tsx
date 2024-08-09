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

import { shareChat } from "@/app/actions";
import { ButtonScrollToBottom } from "@/components/button-scroll-to-bottom";
import { ChatShareDialog } from "@/components/chat-share-dialog";
import { FooterText } from "@/components/footer";
import { IconShare } from "@/components/icons";
import { PromptForm } from "@/components/prompt-form";
import type { AI } from "@/lib/chat/actions";
import { Button } from "@lightdotso/ui";
import { useAIState, useActions, useUIState } from "ai/rsc";
import { nanoid } from "nanoid";
import { useState } from "react";
import { UserMessage } from "./stocks/message";

export interface ChatPanelProps {
  id?: string;
  title?: string;
  input: string;
  setInput: (value: string) => void;
  isAtBottom: boolean;
  scrollToBottom: () => void;
}

export function ChatPanel({
  id,
  title,
  input,
  setInput,
  isAtBottom,
  scrollToBottom,
}: ChatPanelProps) {
  const [aiState] = useAIState();
  const [messages, setMessages] = useUIState<typeof AI>();
  const { submitUserMessage } = useActions();
  // biome-ignore lint/correctness/noUnusedVariables: <explanation>
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const exampleMessages = [
    {
      heading: "What are the",
      subheading: "trending memecoins today?",
      message: "What are the trending memecoins today?",
    },
    {
      heading: "What is the price of",
      subheading: "$DOGE right now?",
      message: "What is the price of $DOGE right now?",
    },
    {
      heading: "I would like to buy",
      subheading: "42 $DOGE",
      message: "I would like to buy 42 $DOGE",
    },
    {
      heading: "What are some",
      subheading: "recent events about $DOGE?",
      message: "What are some recent events about $DOGE?",
    },
  ];

  return (
    <div className="fixed inset-x-0 bottom-0 w-full animate-in bg-gradient-to-b from-0% from-muted/30 to-50% to-muted/30 duration-300 ease-in-out peer-[[data-state=open]]:group-[]:lg:pl-[250px] peer-[[data-state=open]]:group-[]:xl:pl-[300px] dark:from-10% dark:from-background/10 dark:to-background/80">
      <ButtonScrollToBottom
        isAtBottom={isAtBottom}
        scrollToBottom={scrollToBottom}
      />

      <div className="mx-auto sm:max-w-2xl sm:px-4">
        <div className="mb-4 grid grid-cols-2 gap-2 px-4 sm:px-0">
          {messages.length === 0 &&
            exampleMessages.map((example, index) => (
              // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
              <div
                key={example.heading}
                className={`cursor-pointer rounded-lg border bg-white p-4 hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900 ${
                  index > 1 && "hidden md:block"
                }`}
                onClick={async () => {
                  setMessages((currentMessages) => [
                    ...currentMessages,
                    {
                      id: nanoid(),
                      display: <UserMessage>{example.message}</UserMessage>,
                    },
                  ]);

                  const responseMessage = await submitUserMessage(
                    example.message,
                  );

                  setMessages((currentMessages) => [
                    ...currentMessages,
                    responseMessage,
                  ]);
                }}
              >
                <div className="font-semibold text-sm">{example.heading}</div>
                <div className="text-sm text-zinc-600">
                  {example.subheading}
                </div>
              </div>
            ))}
        </div>

        {messages?.length >= 2 ? (
          <div className="flex h-12 items-center justify-center">
            <div className="flex space-x-2">
              {id && title ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setShareDialogOpen(true)}
                  >
                    <IconShare className="mr-2" />
                    Share
                  </Button>
                  <ChatShareDialog
                    // open={shareDialogOpen}
                    // onOpenChange={setShareDialogOpen}
                    onCopy={() => setShareDialogOpen(false)}
                    // @ts-expect-error
                    shareChatAction={shareChat}
                    chat={{
                      id,
                      title,
                      messages: aiState.messages,
                    }}
                  />
                </>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="space-y-4 border-t bg-background px-4 py-2 shadow-lg sm:rounded-t-xl sm:border md:py-4">
          <PromptForm input={input} setInput={setInput} />
          <FooterText className="hidden sm:block" />
        </div>
      </div>
    </div>
  );
}
