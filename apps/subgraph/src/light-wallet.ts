// Copyright 2023-2024 Light
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

import { Bytes } from "@graphprotocol/graph-ts";
import {
  AccountDeployed as AccountDeployedEvent,
  UserOperationEvent as UserOperationEventEvent,
  UserOperationRevertReason as UserOperationRevertReasonEvent,
} from "../generated/EntryPointv0.6.0/EntryPoint";
import { Lightallet as LightaletInterface } from "../generated/EntryPointv0.6.0/Lightallet";
import {
  Lightallet,
  UserOperation,
  UserOperationEvent,
  UserOperationRevertReason,
} from "../generated/schema";
import { lightWalletFactories } from "./config";
import {
  getUserOpCount,
  getUserOpRevertCount,
  getUserOpSuccessCount,
  getWalletCount,
  incrementUserOpCount,
  incrementUserOpRevertCount,
  incrementUserOpSuccessCount,
  incrementWalletCount,
} from "./counter";
import { handleUserOperationLogs } from "./log";
import { handleUserOperationTransaction } from "./transaction";
import { handleUserOperationFromCalldata } from "./user-operation";

export function handleLightalletDeployed(event: AccountDeployedEvent): void {
  // If the event is emitted by one of the factories, then we know that the account is a Lightallet
  // If it is one of the factories, the index will be greater than -1
  // If it is not one of the factories, the index will be -1
  if (lightWalletFactories.indexOf(event.params.factory) > -1) {
    // Increment the wallet count
    incrementWalletCount();

    // Create a new Lightallet entity
    let lightWallet = new Lightallet(event.params.sender);
    lightWallet.index = getWalletCount();
    lightWallet.address = event.params.sender;

    lightWallet.userOpHash = event.params.userOpHash;
    lightWallet.sender = event.params.sender;
    lightWallet.factory = event.params.factory;
    lightWallet.paymaster = event.params.paymaster;

    lightWallet.blockNumber = event.block.number;
    lightWallet.blockTimestamp = event.block.timestamp;
    lightWallet.transactionHash = event.transaction.hash;
    lightWallet.userOperations = [];

    // Get the image hash of the Lightallet
    let wallet = LightaletInterface.bind(event.params.sender);
    let try_imageHash = wallet.try_imageHash();
    lightWallet.imageHash = try_imageHash.reverted
      ? new Bytes(0)
      : try_imageHash.value;

    lightWallet.save();
  }
}

export function handleLightalletUserOperationEvent(
  event: UserOperationEventEvent,
): void {
  // Get the Lightallet entity
  let lightWallet = Lightallet.load(event.params.sender);

  // Handle if the account exists
  if (lightWallet != null) {
    // Increment the user operation count
    incrementUserOpCount();
    // Increment the user operation revert count
    incrementUserOpSuccessCount();

    // -------------------------------------------------------------------------
    // START OF BOILERPLATE
    // -------------------------------------------------------------------------

    // Handle transaction for the user operation
    handleUserOperationTransaction(
      event.params.userOpHash,
      event.transaction,
      event.receipt,
    );
    // Get the logs from the user operation
    handleUserOperationLogs(
      event.params.userOpHash,
      event.transaction,
      event.receipt,
    );

    // Create a new UserOperation entity
    let op = new UserOperation(event.params.userOpHash);
    op.index = getUserOpCount();

    // If the function is `handleOps`, deconstruct the calldata
    if (
      event.transaction.input.toHexString().substring(0, 10) == "0x1fad948c"
    ) {
      let struct = handleUserOperationFromCalldata(
        event.transaction.input.toHexString(),
        event.params.nonce,
      );
      op.sender = struct.sender;
      op.nonce = struct.nonce;
      op.initCode = struct.initCode;
      op.callData = struct.callData;
      op.callGasLimit = struct.callGasLimit;
      op.verificationGasLimit = struct.verificationGasLimit;
      op.preVerificationGas = struct.preVerificationGas;
      op.maxFeePerGas = struct.maxFeePerGas;
      op.maxPriorityFeePerGas = struct.maxPriorityFeePerGas;
      op.paymasterAndData = struct.paymasterAndData;
      op.signature = struct.signature;
    }

    op.blockNumber = event.block.number;
    op.blockTimestamp = event.block.timestamp;
    op.transactionHash = event.transaction.hash;

    op.entryPoint = event.address;
    op.paymaster = event.params.paymaster;

    op.transaction = event.transaction.hash;

    op.save();

    // Add the user operation to the Lightallet
    lightWallet.userOperations = lightWallet.userOperations.concat([
      event.params.userOpHash,
    ]);
    lightWallet.save();

    // -------------------------------------------------------------------------
    // END OF BOILERPLATE
    // -------------------------------------------------------------------------

    if (event.params.success) {
      incrementUserOpSuccessCount();
    }

    let entity = new UserOperationEvent(event.params.userOpHash);
    entity.index = getUserOpSuccessCount();
    entity.userOpHash = event.params.userOpHash;
    entity.sender = event.params.sender;
    entity.paymaster = event.params.paymaster;
    entity.nonce = event.params.nonce;
    entity.success = event.params.success;
    entity.actualGasCost = event.params.actualGasCost;
    entity.actualGasUsed = event.params.actualGasUsed;

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;

    // Add the user operation reference to the event
    entity.userOperation = event.params.userOpHash;

    entity.save();
  }
}

export function handleLightalletUserOperationRevertReason(
  event: UserOperationRevertReasonEvent,
): void {
  // Get the Lightallet entity
  let lightWallet = Lightallet.load(event.params.sender);

  // Handle if the account exists
  if (lightWallet != null) {
    // Increment the user operation count
    incrementUserOpCount();
    // Increment the user operation revert count
    incrementUserOpRevertCount();

    // -------------------------------------------------------------------------
    // START OF BOILERPLATE
    // -------------------------------------------------------------------------

    // Handle transaction for the user operation
    handleUserOperationTransaction(
      event.params.userOpHash,
      event.transaction,
      event.receipt,
    );
    // Get the logs from the user operation
    handleUserOperationLogs(
      event.params.userOpHash,
      event.transaction,
      event.receipt,
    );

    // Create a new UserOperation entity
    let op = new UserOperation(event.params.userOpHash);
    op.index = getUserOpCount();

    // If the function is `handleOps`, deconstruct the calldata
    if (
      event.transaction.input.toHexString().substring(0, 10) == "0x1fad948c"
    ) {
      let struct = handleUserOperationFromCalldata(
        event.transaction.input.toHexString(),
        event.params.nonce,
      );
      op.sender = struct.sender;
      op.nonce = struct.nonce;
      op.initCode = struct.initCode;
      op.callData = struct.callData;
      op.callGasLimit = struct.callGasLimit;
      op.verificationGasLimit = struct.verificationGasLimit;
      op.preVerificationGas = struct.preVerificationGas;
      op.maxFeePerGas = struct.maxFeePerGas;
      op.maxPriorityFeePerGas = struct.maxPriorityFeePerGas;
      op.paymasterAndData = struct.paymasterAndData;
      op.signature = struct.signature;
    }

    op.blockNumber = event.block.number;
    op.blockTimestamp = event.block.timestamp;
    op.transactionHash = event.transaction.hash;

    op.entryPoint = event.address;
    // op.paymaster = event.params.paymaster;

    op.transaction = event.transaction.hash;

    op.save();

    // Add the user operation to the Lightallet
    lightWallet.userOperations = lightWallet.userOperations.concat([
      event.params.userOpHash,
    ]);
    lightWallet.save();

    // -------------------------------------------------------------------------
    // END OF BOILERPLATE
    // -------------------------------------------------------------------------

    let entity = new UserOperationRevertReason(
      event.transaction.hash.concatI32(event.logIndex.toI32()),
    );
    entity.index = getUserOpRevertCount();
    entity.userOpHash = event.params.userOpHash;
    entity.sender = event.params.sender;
    entity.nonce = event.params.nonce;
    entity.revertReason = event.params.revertReason;

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;

    // Add the user operation reference to the event
    entity.userOperation = event.params.userOpHash;

    entity.save();
  }
}
