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

import { Bytes, ethereum } from "@graphprotocol/graph-ts";
import { Log } from "../generated/schema";
import {
  BEFORE_EXECUTION_EVENT_HASH,
  USER_OPERATION_EVENT_HASH,
} from "./const";

export function handleUserOperationLogs(
  userOpHash: Bytes,
  eventTransaction: ethereum.Transaction,
  eventReceipt: ethereum.TransactionReceipt | null,
): Log[] {
  let logs = new Array<Log>();

  if (eventReceipt) {
    // Flag to store the log in relation to the user operation
    let flag = false;

    // Iterate through the receipt logs in reverse order
    // This is because the `UserOperationEvent` event is emitted after the logs are emitted
    // Break until the `BeforeExecution` event is emitted
    for (let i = eventReceipt.logs.length - 1; i >= 0; i--) {
      // Load the Log entity
      let log = Log.load(`${eventTransaction.hash}-${i}`);

      // If the Log entity doesn't exist, break;
      if (log == null) {
        break;
      }

      // Get the topic from the log
      let topic = eventReceipt.logs[i].topics[0];

      // If the topic is an `UserOperationEvent` topic, get the user operation hash
      if (topic.toHexString() == USER_OPERATION_EVENT_HASH) {
        // Get the log user operation hash from the log (the first topic is the event hash)
        let logUserOpHash = eventReceipt.logs[i].topics[1];
        // If the log user operation hash is equal to the event user operation hash, set the flag to true
        if (logUserOpHash == userOpHash) {
          flag = true;
        } else {
          // If the log user operation hash is not equal to the event user operation hash, set the flag to false
          // Could be break, since we handle the logs for a `UserOperationEvent` event
          flag = false;
        }
      }

      // If the topic is an `BeforeExecution` topic, break
      if (topic.toHexString() == BEFORE_EXECUTION_EVENT_HASH) {
        break;
      }

      // If the flag is true, set the user operation hash to the log
      if (flag) {
        log.userOperation = userOpHash;
        log.save();
      }
    }
  }

  return logs;
}
