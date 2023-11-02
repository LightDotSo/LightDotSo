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

import { log, ethereum } from "@graphprotocol/graph-ts";
import { UserOperationEvent as UserOperationEventEvent } from "../generated/EntryPointv0.6.0/EntryPoint";
import { Log, Receipt, Transaction } from "../generated/schema";

export function handleUserOperationTransaction(
  event: UserOperationEventEvent,
): Transaction {
  // Decode the user operation from the input
  log.info("userOpHash: {}", [event.params.userOpHash.toString()]);

  // Load the Transaction entity
  let transaction = Transaction.load(event.transaction.hash);
  if (transaction == null) {
    // Create a new Transaction entity if null
    transaction = new Transaction(event.transaction.hash);
    // Set the transaction fields
    transaction.hash = event.transaction.hash;
    transaction.index = event.transaction.index;
    transaction.from = event.transaction.from;
    transaction.to = event.transaction.to;
    transaction.value = event.transaction.value;
    transaction.gasLimit = event.transaction.gasLimit;
    transaction.gasPrice = event.transaction.gasPrice;
    transaction.input = event.transaction.input;
    transaction.nonce = event.transaction.nonce;
  }

  // If event.receipt exists, create a new Receipt entity
  if (event.receipt != null) {
    let eventReceipt = event.receipt as ethereum.TransactionReceipt;

    // Load the Receipt entity
    let receipt = Receipt.load(event.transaction.hash);
    if (receipt == null) {
      // Create a new Receipt entity if null
      receipt = new Receipt(event.transaction.hash);
      // Set the receipt fields
      receipt.transactionHash = eventReceipt.transactionHash;
      receipt.transactionIndex = eventReceipt.transactionIndex;
      receipt.blockHash = eventReceipt.blockHash;
      receipt.blockNumber = eventReceipt.blockNumber;
      receipt.cumulativeGasUsed = eventReceipt.cumulativeGasUsed;
      receipt.gasUsed = eventReceipt.gasUsed;
      receipt.contractAddress = eventReceipt.contractAddress;
      receipt.status = eventReceipt.status;
      receipt.root = eventReceipt.root;
      receipt.logsBloom = eventReceipt.logsBloom;
    }

    for (let i = 0; i < eventReceipt.logs.length; i++) {
      // Load the Log entity
      let log = Log.load(`${event.transaction.hash}-${i}`);
      if (log == null) {
        // Create a new Log entity if null
        log = new Log(`${event.transaction.hash}-${i}`);
        // Set the log fields
        log.address = eventReceipt.logs[i].address;
        log.topics = eventReceipt.logs[i].topics;
        log.data = eventReceipt.logs[i].data;
        log.blockHash = eventReceipt.logs[i].blockHash;
        log.blockNumber = eventReceipt.logs[i].blockNumber;
        log.transactionHash = eventReceipt.logs[i].transactionHash;
        log.transactionIndex = eventReceipt.logs[i].transactionIndex;
        log.logIndex = eventReceipt.logs[i].logIndex;
        log.transactionLogIndex = eventReceipt.logs[i].transactionLogIndex;
        log.logType = eventReceipt.logs[i].logType;
        // log.removed = eventReceipt.logs[i].removed?.inner;
        log.save();
      }

      // Add the logs to the receipt
      if (receipt.logs == null) {
        receipt.logs = [log.id];
      } else {
        receipt.logs!.push(log.id);
      }
    }

    receipt.save();

    transaction.receipt = receipt.id;
  }

  // Initialize the user operation array
  transaction.userOperation = [];

  return transaction;
}
