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

import * as z from "zod";

// -----------------------------------------------------------------------------
// Schema
// -----------------------------------------------------------------------------

const userOperation = z.object({
  chainId: z.number().optional(),
  callData: z.string().optional(),
  initCode: z.string().optional(),
});

const userOperations = z.array(userOperation);

export const confirmFormConfigurationSchema = z.object({
  transfers: userOperations,
});

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type UserOperation = z.infer<typeof userOperation>;
export type UserOperations = z.infer<typeof userOperations>;
export type ConfirmFormConfiguration = z.infer<
  typeof confirmFormConfigurationSchema
>;
