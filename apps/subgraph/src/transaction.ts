// Copyright 2023-2024 LightDotSo.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import type { Bytes, ethereum } from "@graphprotocol/graph-ts";
import { Log, Receipt, Transaction } from "../generated/schema";

export function handleUserOperationTransaction(
  userOpHash: Bytes,
  eventTransaction: ethereum.Transaction,
  eventReceipt: ethereum.TransactionReceipt | null,
): void {
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

    transaction.save();
  }

  // If event.receipt exists, create a new Receipt entity
  if (eventReceipt) {
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
      receipt.status = eventReceipt.status;
      receipt.logsBloom = eventReceipt.logsBloom;
      // receipt.contractAddress = eventReceipt.contractAddress;
      // receipt.root = eventReceipt.root;

      receipt.transaction = eventTransaction.hash;

      receipt.save();

      // Log the log
      for (let i = 0; i < eventReceipt.logs.length; i++) {
        // Load the Log entity
        let log = Log.load(`${eventTransaction.hash.toHexString()}-${i}`);
        if (log == null) {
          // Create a new Log entity if null
          log = new Log(`${eventTransaction.hash.toHexString()}-${i}`);
          // Set the log fields
          log.address = eventReceipt.logs[i].address;
          log.topics = eventReceipt.logs[i].topics;
          log.data = eventReceipt.logs[i].data;
          log.blockHash = eventReceipt.logs[i].blockHash;
          log.blockNumber = eventReceipt.logs[i].blockNumber;
          log.transactionHash = eventReceipt.logs[i].transactionHash;
          log.transactionIndex = eventReceipt.logs[i].transactionIndex;
          log.logIndex = eventReceipt.logs[i].logIndex;
          // log.transactionLogIndex = eventReceipt.logs[i].transactionLogIndex;
          // log.logType = eventReceipt.logs[i].logType;
          // log.removed = eventReceipt.logs[i].removed?.inner;

          log.receipt = eventTransaction.hash;

          log.save();
        }
      }
    }
  }
}
