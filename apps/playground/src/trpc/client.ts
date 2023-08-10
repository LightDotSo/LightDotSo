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

"use client";

import { loggerLink } from "@trpc/client";
import {
  experimental_createActionHook,
  experimental_serverActionLink,
} from "@trpc/next/app-dir/client";
import { experimental_createTRPCNextReactQuery } from "@trpc/next/app-dir/react";
import type { AppRouter } from "@/server/routers/_app";
import superjson from "superjson";

export const api = experimental_createTRPCNextReactQuery<AppRouter>({});

export const useAction = experimental_createActionHook({
  links: [loggerLink(), experimental_serverActionLink()],
  transformer: superjson,
});
