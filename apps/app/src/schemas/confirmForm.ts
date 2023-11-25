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
import { userOperation } from "@/types";

// -----------------------------------------------------------------------------
// Schema
// -----------------------------------------------------------------------------

const partialUserOperation = userOperation.partial();

const partialUserOperations = z.array(partialUserOperation);

export const confirmFormConfigurationSchema = z.object({
  transfers: partialUserOperations,
});

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type PartialUserOperation = z.infer<typeof partialUserOperation>;
export type PartialUserOperations = z.infer<typeof partialUserOperations>;
export type ConfirmFormConfiguration = z.infer<
  typeof confirmFormConfigurationSchema
>;
