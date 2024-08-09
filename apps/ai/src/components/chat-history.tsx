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

import { IconPlus } from "@/components/icons";
import { SidebarList } from "@/components/sidebar-list";
import { buttonVariants } from "@lightdotso/ui";
import { cn } from "@lightdotso/utils";
import Link from "next/link";
import { Suspense } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface ChatHistoryProps {
  userId?: string;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export async function ChatHistory({ userId }: ChatHistoryProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between p-4">
        <h4 className="font-medium text-sm">Chat History</h4>
      </div>
      <div className="mb-2 px-2">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-10 w-full justify-start bg-zinc-50 px-4 shadow-none transition-colors hover:bg-zinc-200/40 dark:bg-zinc-900 dark:hover:bg-zinc-300/10",
          )}
        >
          <IconPlus className="-translate-x-2 stroke-2" />
          New Chat
        </Link>
      </div>
      <Suspense
        fallback={
          <div className="flex flex-1 flex-col space-y-4 overflow-auto px-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                key={i}
                className="h-6 w-full shrink-0 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800"
              />
            ))}
          </div>
        }
      >
        {/* @ts-ignore */}
        <SidebarList userId={userId} />
      </Suspense>
    </div>
  );
}
