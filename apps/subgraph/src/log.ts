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

import { ethereum } from "@graphprotocol/graph-ts";
import { UserOperationEvent as UserOperationEventEvent } from "../generated/EntryPointv0.6.0/EntryPoint";
import { Log } from "../generated/schema";

export function handleUserOperationLogs(event: UserOperationEventEvent): Log[] {
  let logs = new Array<Log>();

  if (event.receipt) {
    let eventReceipt = event.receipt as ethereum.TransactionReceipt;

    // Flag to store the log in relation to the user operation
    let flag = false;

    // Iterate through the receipt logs in reverse order
    // This is because the `UserOperationEvent` event is emitted after the logs are emitted
    // Break until the `BeforeExecution` event is emitted
    for (let i = eventReceipt.logs.length - 1; i >= 0; i--) {
      // Load the Log entity
      let log = Log.load(`${event.transaction.hash}-${i}`);

      // If the Log entity doesn't exist, break;
      if (log == null) {
        break;
      }

      // Get the topic from the log
      let topic = eventReceipt.logs[i].topics[0];

      // If the topic is an `UserOperationEvent` topic, get the user operation hash
      if (topic.toHexString() == "0x0000000") {
        let logUserOpHash = eventReceipt.logs[i].data;
        // If the log user operation hash is equal to the event user operation hash, set the flag to true
        if (logUserOpHash == event.params.userOpHash) {
          flag = true;
        } else {
          // If the log user operation hash is not equal to the event user operation hash, set the flag to false
          // Could be break, because we handle the logs for a `UserOperationEvent` event
          flag = false;
        }
      }

      // If the topic is an `BeforeExecution` topic, break
      if (topic.toHexString() == "0x0000000") {
        break;
      }

      if (flag) {
        log.userOperation = event.params.userOpHash;
      }

      log.save();
    }
  }

  return logs;
}
