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

"use server";

import { createPost } from "@/server/routers/_app";
import { createAction, publicProcedure } from "@/server/trpc";
import { z } from "zod";

/**
 * Either inline procedures using trpc's flexible
 * builder api, with input parsers and middleware
 * Wrap the procedure in a `createAction` call to
 * make it server-action friendly
 */
export const testAction = createAction(
  publicProcedure
    .input(
      z.object({
        text: z.string().min(1),
      }),
    )
    .mutation(async opts => {
      // eslint-disable-next-line no-console
      console.log("testMutation called", opts);
      return {
        text: "Hello world",
        date: new Date(),
      };
    }),
);

/**
 * Or, you can create actions from existing procedures
 * by importing them and wrapping them in `createAction`
 */
export const createPostAction = createAction(createPost);
