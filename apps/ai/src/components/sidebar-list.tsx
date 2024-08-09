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

import { clearChats, getChats } from "@/app/actions";
import { ClearHistory } from "@/components/clear-history";
import { SidebarItems } from "@/components/sidebar-items";
import { ThemeToggle } from "@/components/theme-toggle";
import { type ReactNode, cache } from "react";

interface SidebarListProps {
  userId?: string;
  children?: ReactNode;
}

const loadChats = cache(async (userId?: string) => {
  return await getChats(userId);
});

export async function SidebarList({ userId }: SidebarListProps) {
  const chats = (await loadChats(userId)) ?? [];

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-auto">
        {chats?.length ? (
          <div className="space-y-2 px-2">
            <SidebarItems chats={chats} />
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground text-sm">No chat history</p>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between p-4">
        <ThemeToggle />
        <ClearHistory
          clearChatsAction={clearChats}
          isEnabled={chats?.length > 0}
        />
      </div>
    </div>
  );
}
