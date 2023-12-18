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

import { notFound } from "next/navigation";
import type { Hex } from "viem";
import { handler as addressHandler } from "@/handlers/paths/[address]/handler";
import {
  validateAddress,
  validateUserOperationHash,
} from "@/handlers/validators";
import { getUserOperation } from "@/services/getUserOperation";

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

export const handler = async (params: {
  address: string;
  userOperationHash: string;
}) => {
  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const { config } = await addressHandler(params);

  // ---------------------------------------------------------------------------
  // Validators
  // ---------------------------------------------------------------------------

  validateAddress(params.address);

  validateUserOperationHash(params.userOperationHash);

  // ---------------------------------------------------------------------------
  // Fetch
  // ---------------------------------------------------------------------------

  const userOperation = await getUserOperation({
    hash: params.userOperationHash as Hex,
  });

  // ---------------------------------------------------------------------------
  // Parse
  // ---------------------------------------------------------------------------

  return userOperation.match(
    userOperation => {
      return { config: config, userOperation: userOperation };
    },
    () => {
      notFound();
    },
  );
};
