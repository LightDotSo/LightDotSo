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

// Copyright 2023-2024 Silius Contributors.
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

use alloy::rpc::types::trace::geth::GethTrace;
use eyre::format_err;
use serde::Deserialize;

// From: https://github.com/silius-rs/silius/blob/a266eb22b46a86647556c4c8248663b3e25a5235/crates/contracts/src/executor_tracer.rs#L5-L8
// License: Apache-2.0

#[derive(Debug, Clone, Default, PartialEq, Eq, Deserialize)]
pub struct LogInfo {
    pub topics: Vec<String>,
    pub data: String,
}

// From: https://github.com/silius-rs/silius/blob/a266eb22b46a86647556c4c8248663b3e25a5235/crates/contracts/src/executor_tracer.rs#L10-L25
// License: Apache-2.0

#[derive(Debug, Clone, Default, PartialEq, Eq, Deserialize)]
pub struct ExecutorTracerResult {
    pub reverts: Vec<String>,
    #[serde(rename = "validationOOG")]
    pub validation_oog: bool,
    #[serde(rename = "executionOOG")]
    pub execution_oog: bool,
    #[serde(rename = "executionGasLimit")]
    pub execution_gas_limit: u64,
    #[serde(rename = "userOperationEvent")]
    pub user_op_event: Option<LogInfo>,
    #[serde(rename = "userOperationRevertEvent")]
    pub user_op_revert_event: Option<LogInfo>,
    pub output: String,
    pub error: String,
}

impl TryFrom<GethTrace> for ExecutorTracerResult {
    type Error = eyre::Error;
    fn try_from(val: GethTrace) -> Result<Self, Self::Error> {
        match val {
            GethTrace::Default(val) => serde_json::from_slice(&val.return_value)
                .map_err(|error| format_err!("Failed to parse geth trace: {error}, {val:#?}")),
            _ => Err(format_err!("Invalid geth trace: {val:?}")),
        }
    }
}

// From: https://github.com/silius-rs/silius/blob/a266eb22b46a86647556c4c8248663b3e25a5235/crates/contracts/src/executor_tracer.rs#L36-185
// License: Apache-2.0

pub const EXECUTOR_TRACER: &str = r#"
{
    reverts: [],
    validationOOG: false,
    executionOOG: false,
    executionGasLimit: 0,
  
    _depth: 0,
    _executionGasStack: [],
    _defaultGasItem: { used: 0, required: 0 },
    _marker: 0,
    _validationMarker: 1,
    _executionMarker: 3,
    _userOperationEventTopics0:
      "0x49628fd1471006c1482da88028e9ce4dbb080b815c9b0344d39e5a8e6ec1419f",
    _userOperationRevertEventTopics0:
      "0x1c4fada7374c0a9ee8841fc38afe82932dc0f8e69012e927f061a8bae611a201",
  
    _isValidation: function () {
      return (
        this._marker >= this._validationMarker &&
        this._marker < this._executionMarker
      );
    },
  
    _isExecution: function () {
      return this._marker === this._executionMarker;
    },
  
    _isUserOperationEvent: function (log) {
      var topics0 = "0x" + log.stack.peek(2).toString(16);
      return topics0 === this._userOperationEventTopics0;
    },
  
    _setUserOperationEvent: function (opcode, log) {
      var count = parseInt(opcode.substring(3));
      var ofs = parseInt(log.stack.peek(0).toString());
      var len = parseInt(log.stack.peek(1).toString());
      var topics = [];
      for (var i = 0; i < count; i++) {
        topics.push(log.stack.peek(2 + i).toString(16));
      }
      var data = toHex(log.memory.slice(ofs, ofs + len));
      this.userOperationEvent = {
        topics: topics,
        data: data,
      };
    },
  
    _isUserOperationRevertEvent: function (log) {
      var topics0 = "0x" + log.stack.peek(2).toString(16);
      return topics0 === this._userOperationRevertEventTopics0;
    },
  
    _setUserOperationRevertEvent: function (opcode, log) {
      var count = parseInt(opcode.substring(3));
      var ofs = parseInt(log.stack.peek(0).toString());
      var len = parseInt(log.stack.peek(1).toString());
      var topics = [];
      for (var i = 0; i < count; i++) {
        topics.push(log.stack.peek(2 + i).toString(16));
      }
      var data = toHex(log.memory.slice(ofs, ofs + len));
      this.userOperationRevertEvent = {
        topics: topics,
        data: data,
      };
    },
    fault: function fault(log, db) {},
    result: function result(ctx, db) {
      return {
        reverts: this.reverts,
        validationOOG: this.validationOOG,
        executionOOG: this.executionOOG,
        executionGasLimit: this.executionGasLimit,
        userOperationEvent: this.userOperationEvent,
        userOperationRevertEvent: this.userOperationRevertEvent,
        output: toHex(ctx.output),
        error: ctx.error,
      };
    },
  
    enter: function enter(frame) {
      if (this._isExecution()) {
        var next = this._depth + 1;
        if (this._executionGasStack[next] === undefined)
          this._executionGasStack[next] = Object.assign({}, this._defaultGasItem);
      }
    },
    exit: function exit(frame) {
      if (this._isExecution()) {
        if (frame.getError() !== undefined) {
          this.reverts.push(toHex(frame.getOutput()));
        }
  
        if (this._depth >= 2) {
          // Get the final gas item for the nested frame.
          var nested = Object.assign(
            {},
            this._executionGasStack[this._depth + 1] || this._defaultGasItem
          );
  
          // Reset the nested gas item to prevent double counting on re-entry.
          this._executionGasStack[this._depth + 1] = Object.assign(
            {},
            this._defaultGasItem
          );
  
          // Keep track of the total gas used by all frames at this depth.
          // This does not account for the gas required due to the 63/64 rule.
          var used = frame.getGasUsed();
          this._executionGasStack[this._depth].used += used;
  
          // Keep track of the total gas required by all frames at this depth.
          // This accounts for additional gas needed due to the 63/64 rule.
          this._executionGasStack[this._depth].required +=
            used - nested.used + Math.ceil((nested.required * 64) / 63);
  
          // Keep track of the final gas limit.
          this.executionGasLimit = this._executionGasStack[this._depth].required;
        }
      }
    },
  
    step: function step(log, db) {
      var opcode = log.op.toString();
      this._depth = log.getDepth();
      if (this._depth === 1 && opcode === "NUMBER") this._marker++;
  
      if (
        this._depth <= 2 &&
        opcode.startsWith("LOG") &&
        this._isUserOperationEvent(log)
      )
        this._setUserOperationEvent(opcode, log);
      if (
          this._depth <= 2 &&
          opcode.startsWith("LOG") &&
          this._isUserOperationRevertEvent(log)
        )
          this._setUserOperationRevertEvent(opcode, log);
    
      if (log.getGas() < log.getCost() && this._isValidation())
        this.validationOOG = true;
  
      if (log.getGas() < log.getCost() && this._isExecution())
        this.executionOOG = true;
    },
  } 
"#;
