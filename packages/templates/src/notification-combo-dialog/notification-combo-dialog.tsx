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

import { EmptyState } from "@lightdotso/elements";
import {
  useQueryNotifications,
  useQueryNotificationsCount,
} from "@lightdotso/query";
import { useAuth, useComboDialogs } from "@lightdotso/stores";
import {
  ButtonIcon,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@lightdotso/ui";
import { BellIcon, Settings2 } from "lucide-react";
import Link from "next/link";
import type { FC } from "react";
import { BadgeCountButton } from "../badge-count-button";
import { ComboDialog } from "../combo-dialog";
import { Login } from "../login";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const NotificationComboDialog: FC = () => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { sessionId, wallet } = useAuth();
  const { isNotificationComboDialogOpen, toggleIsNotificationComboDialogOpen } =
    useComboDialogs();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { notifications } = useQueryNotifications({
    address: wallet,
    limit: 10,
    offset: 0,
  });

  const { notificationsCount } = useQueryNotificationsCount({
    address: wallet,
  });

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  return (
    <ComboDialog
      className="w-96 p-0"
      buttonTrigger={
        <BadgeCountButton count={notificationsCount?.count}>
          <BellIcon className="size-4" />
        </BadgeCountButton>
      }
      isOpen={isNotificationComboDialogOpen}
      onOpenChange={toggleIsNotificationComboDialogOpen}
    >
      <Tabs defaultValue="inbox" variant="outline">
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
            className="m-1 rounded-full"
          >
            <Link href="/settings/notifications">
              <Settings2 className="size-4" />
              <span className="sr-only">Open settings</span>
            </Link>
          </ButtonIcon>
        </div>
        <TabsContent value="inbox">
          {!sessionId && <Login />}
          {notifications?.map((notification) => (
            <div key={notification.id} className="p-4">
              <p className="text-sm text-text-primary">{notification.id}</p>
            </div>
          ))}
          {notificationsCount?.count === 0 && (
            <div className="w-full justify-center py-8 text-center">
              <EmptyState entity="notification" />
            </div>
          )}
        </TabsContent>
        <TabsContent value="archive">
          {!sessionId && <Login />}
          {notificationsCount?.count === 0 && (
            <div className="w-full justify-center py-8 text-center">
              <EmptyState entity="notification" />
            </div>
          )}
        </TabsContent>
        <TabsContent value="transactions">
          {!sessionId && <Login />}
          {notificationsCount?.count === 0 && (
            <div className="w-full justify-center py-8 text-center">
              <EmptyState entity="notification" />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </ComboDialog>
  );
};
