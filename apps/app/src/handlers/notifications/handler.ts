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

import { addressParser, paginationParser } from "@lightdotso/nuqs";
import {
  getNotifications,
  getNotificationsCount,
  getUser,
} from "@lightdotso/services";
import { unstable_noStore } from "next/cache";
import { Result } from "neverthrow";
import { verifyUserId } from "@/auth";

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

export const handler = async (searchParams: {
  pagination?: string;
  address?: string;
}) => {
  // ---------------------------------------------------------------------------
  // Auth
  // ---------------------------------------------------------------------------

  const userId = await verifyUserId();

  // ---------------------------------------------------------------------------
  // Cache
  // ---------------------------------------------------------------------------

  unstable_noStore();

  // ---------------------------------------------------------------------------
  // Parsers
  // ---------------------------------------------------------------------------

  const paginationState = paginationParser.parseServerSide(
    searchParams.pagination,
  );

  const addressState = addressParser.parseServerSide(searchParams.address);

  // ---------------------------------------------------------------------------
  // Fetch
  // ---------------------------------------------------------------------------

  const userPromise = getUser({
    address: undefined,
    user_id: userId,
  });

  const notificationsPromise = getNotifications({
    address: null,
    offset: paginationState.pageIndex * paginationState.pageSize,
    limit: paginationState.pageSize,
    user_id: userId,
  });

  const notificationsCountPromise = getNotificationsCount({
    address: null,
    user_id: userId,
  });

  const [user, notifications, notificationsCount] = await Promise.all([
    userPromise,
    notificationsPromise,
    notificationsCountPromise,
  ]);

  // ---------------------------------------------------------------------------
  // Parse
  // ---------------------------------------------------------------------------

  const res = Result.combineWithAllErrors([
    user,
    notifications,
    notificationsCount,
  ]);

  return res.match(
    ([user, notifications, notificationsCount]) => {
      return {
        addressState: addressState,
        paginationState: paginationState,
        user: user,
        notifications: notifications,
        notificationsCount: notificationsCount,
      };
    },
    () => {
      return {
        addressState: addressState,
        paginationState: paginationState,
        user: {
          address: "",
          id: "",
        },
        notifications: [],
        notificationsCount: {
          count: 0,
        },
      };
    },
  );
};
