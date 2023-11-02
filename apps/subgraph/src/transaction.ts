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
import { Log, Receipt, Transaction } from "../generated/schema";

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

  // If event.receipt exists, create a new Receipt entity
  if (event.receipt != null) {
    let receipt = new Receipt(event.transaction.hash);

    receipt.transactionHash = event.receipt.transactionHash;
    receipt.transactionIndex = event.receipt.transactionIndex;
    receipt.blockHash = event.receipt.blockHash;
    receipt.blockNumber = event.receipt.blockNumber;
    receipt.cumulativeGasUsed = event.receipt.cumulativeGasUsed;
    receipt.gasUsed = event.receipt.gasUsed;
    receipt.contractAddress = event.receipt.contractAddress;
    receipt.status = event.receipt.status;
    receipt.root = event.receipt.root;
    receipt.logsBloom = event.receipt.logsBloom;

    for (let i = 0; i < event.receipt.logs.length; i++) {
      let log = Log.load(`${event.transaction.hash}-${i}`);

      if (log == null) {
        log = new Log(`${event.transaction.hash}-${i}`);
        log.address = event.receipt.logs[i].address;
        log.topics = event.receipt.logs[i].topics;
        log.data = event.receipt.logs[i].data;
        log.blockHash = event.receipt.logs[i].blockHash;
        log.blockNumber = event.receipt.logs[i].blockNumber;
        log.transactionHash = event.receipt.logs[i].transactionHash;
        log.transactionIndex = event.receipt.logs[i].transactionIndex;
        log.logIndex = event.receipt.logs[i].logIndex;
        log.transactionLogIndex = event.receipt.logs[i].transactionLogIndex;
        log.logType = event.receipt.logs[i].logType;
        // log.removed = event.receipt.logs[i].removed?.inner;
        log.save();
      }
    }

    receipt.save();

    transaction.receipt = receipt.id;
  }

  transaction.save();
}
