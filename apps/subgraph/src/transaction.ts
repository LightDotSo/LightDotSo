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

import { log } from "@graphprotocol/graph-ts";
import { UserOperationEvent as UserOperationEventEvent } from "../generated/EntryPointv0.6.0/EntryPoint";
import { Transaction } from "../generated/schema";

export function handleUserOperationTransaction(
  event: UserOperationEventEvent,
): void {
  // Decode the user operation from the input
  log.info("userOpHash: {}", [event.params.userOpHash.toString()]);

  // Create a new Transaction entity
  let transaction = new Transaction(event.transaction.hash);

  transaction.hash = event.transaction.hash;
  transaction.index = event.transaction.index;
  transaction.from = event.transaction.from;
  transaction.to = event.transaction.to;
  transaction.value = event.transaction.value;
  transaction.gasLimit = event.transaction.gasLimit;
  transaction.gasPrice = event.transaction.gasPrice;
  transaction.input = event.transaction.input;
  transaction.nonce = event.transaction.nonce;

  transaction.save();
}
