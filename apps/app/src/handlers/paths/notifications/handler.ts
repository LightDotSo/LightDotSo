// Copyright (C) 2023 Light, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { paginationParser } from "@lightdotso/nuqs";
import { getNotifications, getNotificationsCount } from "@lightdotso/services";
import { Result } from "neverthrow";
import { verifyUserId } from "@/auth";

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

export const handler = async (searchParams: { pagination?: string }) => {
  // ---------------------------------------------------------------------------
  // Auth
  // ---------------------------------------------------------------------------

  const userId = await verifyUserId();

  // ---------------------------------------------------------------------------
  // Parsers
  // ---------------------------------------------------------------------------

  const paginationState = paginationParser.parseServerSide(
    searchParams.pagination,
  );

  // ---------------------------------------------------------------------------
  // Fetch
  // ---------------------------------------------------------------------------

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

  const [notifications, notificationsCount] = await Promise.all([
    notificationsPromise,
    notificationsCountPromise,
  ]);

  // ---------------------------------------------------------------------------
  // Parse
  // ---------------------------------------------------------------------------

  const res = Result.combineWithAllErrors([notifications, notificationsCount]);

  return res.match(
    ([notifications, notificationsCount]) => {
      return {
        paginationState: paginationState,
        notifications: notifications,
        notificationsCount: notificationsCount,
      };
    },
    () => {
      return {
        paginationState: paginationState,
        notifications: [],
        notificationsCount: {
          count: 0,
        },
      };
    },
  );
};
