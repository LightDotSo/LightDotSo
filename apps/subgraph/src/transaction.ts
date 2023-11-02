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

import { Bytes, log, ethereum } from "@graphprotocol/graph-ts";
import { Log, Receipt, Transaction } from "../generated/schema";

export function handleUserOperationTransaction(
  userOpHash: Bytes,
  eventTransaction: ethereum.Transaction,
  eventReceipt: ethereum.TransactionReceipt | null,
): void {
  // Decode the user operation from the input
  log.info("userOpHash: {}", [userOpHash.toString()]);

  // Load the Transaction entity
  let transaction = Transaction.load(eventTransaction.hash);
  if (transaction == null) {
    // Create a new Transaction entity if null
    transaction = new Transaction(eventTransaction.hash);
    // Set the transaction fields
    transaction.hash = eventTransaction.hash;
    transaction.index = eventTransaction.index;
    transaction.from = eventTransaction.from;
    transaction.to = eventTransaction.to;
    transaction.value = eventTransaction.value;
    transaction.gasLimit = eventTransaction.gasLimit;
    transaction.gasPrice = eventTransaction.gasPrice;
    transaction.input = eventTransaction.input;
    transaction.nonce = eventTransaction.nonce;
  }

  // If event.receipt exists, create a new Receipt entity
  if (eventReceipt != null) {
    // Load the Receipt entity
    let receipt = Receipt.load(eventTransaction.hash);
    if (receipt == null) {
      // Create a new Receipt entity if null
      receipt = new Receipt(eventTransaction.hash);
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
      let log = Log.load(`${eventTransaction.hash}-${i}`);
      if (log == null) {
        // Create a new Log entity if null
        log = new Log(`${eventTransaction.hash}-${i}`);
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

  // Add the logs to the receipt
  if (transaction.userOperation == null) {
    transaction.userOperation = [userOpHash];
  } else {
    transaction.userOperation.push(userOpHash);
  }

  // Save the transaction
  transaction.save();
}
