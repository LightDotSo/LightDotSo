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

import { createAction, publicProcedure } from "@/server/trpc";
import { rhfActionSchema } from "./ReactHookFormExample.schema";

/**
 * Either inline procedures using trpc's flexible
 * builder api, with input parsers and middleware
 * Wrap the procedure in a `createAction` call to
 * make it server-action friendly
 */
export const rhfAction = createAction(
  publicProcedure.input(rhfActionSchema).mutation(async opts => {
    // eslint-disable-next-line no-console
    console.log("testMutation called", opts);
    return {
      text: `Hello ${opts.input.text}`,
      date: new Date(),
    };
  }),
);
