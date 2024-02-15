// Copyright 2023-2024 Light, Inc.
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

import {
  useQueryNotifications,
  useQueryNotificationsCount,
} from "@lightdotso/query";
import { useAuth } from "@lightdotso/stores";
import {
  ButtonIcon,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@lightdotso/ui";
import { BellIcon, Settings2 } from "lucide-react";
import Link from "next/link";
import { FC } from "react";
import { Address } from "viem";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const NotificationPopover: FC = () => {
  const { address } = useAuth();

  const { notifications } = useQueryNotifications({
    address: address as Address,
    limit: 10,
    offset: 0,
  });
  const { notificationsCount } = useQueryNotificationsCount({
    address: address as Address,
  });

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  return (
    <Popover>
      <PopoverTrigger asChild>
        <ButtonIcon variant="outline" className="rounded-full">
          <BellIcon className="size-4" />
          <span className="sr-only">Open notificaitons</span>
        </ButtonIcon>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0">
        <Tabs variant="outline">
          <div className="flex justify-between border-b border-border">
            <TabsList>
              <TabsTrigger value="inbox">Inbox</TabsTrigger>
              <TabsTrigger value="archive">Archive</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
            </TabsList>
            <ButtonIcon
              asChild
              size="sm"
              variant="ghost"
              className="rounded-full m-1"
            >
              <Link href="/settings/notifications">
                <Settings2 className="size-4" />
                <span className="sr-only">Open settings</span>
              </Link>
            </ButtonIcon>
          </div>
          <TabsContent value="inbox">
            <p className="text-sm text-text-primary">
              Make changes to your account here. Click save when you&apos;re
              done.
            </p>
          </TabsContent>
          <TabsContent value="archive">
            <p className="text-sm text-text-primary">
              Change your password here. After saving, you&apos;ll be logged
              out.
            </p>
          </TabsContent>
          <TabsContent value="transactions">
            <p className="text-sm text-text-primary">
              Change your password here. After saving, you&apos;ll be logged
              out.
            </p>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};
