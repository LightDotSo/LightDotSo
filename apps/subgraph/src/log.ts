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
  const logs = new Array<Log>();

  if (eventReceipt) {
    // Flag to store the log in relation to the user operation
    let flag = false;

    // Iterate through the receipt logs in reverse order
    // This is because the `UserOperationEvent` event is emitted after the logs are emitted
    // Break until the `BeforeExecution` event is emitted
    for (let i = eventReceipt.logs.length - 1; i >= 0; i--) {
      // Load the Log entity
      // Get the index from the log in reverse order
      const log = Log.load(`${eventTransaction.hash.toHexString()}-${i}`);

      // If the Log entity doesn't exist, break;
      if (log == null) {
        break;
      }

      // Get the topic from the log
      const topic = eventReceipt.logs[i].topics[0];

      // If the topic is an `UserOperationEvent` topic, get the user operation hash
      if (topic.toHexString() === USER_OPERATION_EVENT_HASH) {
        // Get the log user operation hash from the log (the first topic is the event hash)
        const logUserOpHash = eventReceipt.logs[i].topics[1];
        // If the log user operation hash is equal to the event user operation hash, set the flag to true
        if (logUserOpHash === userOpHash) {
          flag = true;
        } else {
          // If the log user operation hash is not equal to the event user operation hash, set the flag to false
          // Could be break, since we handle the logs for a `UserOperationEvent` event
          flag = false;
        }
      }

      // If the topic is an `BeforeExecution` topic, break
      if (topic.toHexString() === BEFORE_EXECUTION_EVENT_HASH) {
        flag = false;
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
