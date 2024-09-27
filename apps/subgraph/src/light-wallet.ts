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

// biome-ignore lint/style/useImportType: <explanation>
// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { LightWallet as LightWaletInterface } from "../generated/EntryPointv0.6.0/LightWallet";
import {
  LightWallet,
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

// -----------------------------------------------------------------------------
// Handlers
// -----------------------------------------------------------------------------

export function handleLightWalletDeployedGeneric(
  userOpHash: Bytes,
  sender: Bytes,
  factory: Bytes,
  paymaster: Bytes,
  event: ethereum.Event,
): void {
  // If the event is emitted by one of the factories, then we know that the account is a LightWallet
  // If it is one of the factories, the index will be greater than -1
  // If it is not one of the factories, the index will be -1
  if (lightWalletFactories.indexOf(Address.fromBytes(factory)) > -1) {
    // Increment the wallet count
    incrementWalletCount();

    // Create a new LightWallet entity
    const lightWallet = new LightWallet(sender);
    lightWallet.index = getWalletCount();
    lightWallet.address = sender;

    lightWallet.userOpHash = userOpHash;
    lightWallet.sender = sender;
    lightWallet.factory = factory;
    lightWallet.paymaster = paymaster;

    lightWallet.blockNumber = event.block.number;
    lightWallet.blockTimestamp = event.block.timestamp;
    lightWallet.transactionHash = event.transaction.hash;
    lightWallet.userOperations = [];

    // Get the image hash of the LightWallet
    const wallet = LightWaletInterface.bind(Address.fromBytes(sender));
    const tryImageHash = wallet.try_imageHash();
    lightWallet.imageHash = tryImageHash.reverted
      ? new Bytes(0)
      : tryImageHash.value;

    lightWallet.save();
  }
}

export function handleLightWalletUserOperationEventGeneric(
  userOpHash: Bytes,
  sender: Bytes,
  paymaster: Bytes,
  nonce: BigInt,
  success: boolean,
  actualGasCost: BigInt,
  actualGasUsed: BigInt,
  event: ethereum.Event,
): void {
  // Get the LightWallet entity
  const lightWallet = LightWallet.load(sender);

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
      userOpHash,
      event.transaction,
      event.receipt,
    );
    // Get the logs from the user operation
    handleUserOperationLogs(userOpHash, event.transaction, event.receipt);

    // Create a new UserOperation entity
    const op = new UserOperation(userOpHash);
    op.index = getUserOpCount();

    // If the function is `handleOps`, deconstruct the calldata
    if (
      // biome-ignore lint/suspicious/noDoubleEquals: <explanation>
      event.transaction.input.toHexString().substring(0, 10) == "0x1fad948c"
    ) {
      const struct = handleUserOperationFromCalldata(
        event.transaction.input.toHexString(),
        nonce,
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
    op.paymaster = paymaster;

    op.transaction = event.transaction.hash;

    op.save();

    // Add the user operation to the LightWallet
    lightWallet.userOperations = lightWallet.userOperations.concat([
      userOpHash,
    ]);
    lightWallet.save();

    // -------------------------------------------------------------------------
    // END OF BOILERPLATE
    // -------------------------------------------------------------------------

    if (success) {
      incrementUserOpSuccessCount();
    }

    const entity = new UserOperationEvent(userOpHash);
    entity.index = getUserOpSuccessCount();
    entity.userOpHash = userOpHash;
    entity.sender = sender;
    entity.paymaster = paymaster;
    entity.nonce = nonce;
    entity.success = success;
    entity.actualGasCost = actualGasCost;
    entity.actualGasUsed = actualGasUsed;

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;

    // Add the user operation reference to the event
    entity.userOperation = userOpHash;

    entity.save();
  }
}

export function handleLightWalletUserOperationRevertReasonGeneric(
  userOpHash: Bytes,
  sender: Bytes,
  nonce: BigInt,
  revertReason: Bytes,
  event: ethereum.Event,
): void {
  // Get the LightWallet entity
  const lightWallet = LightWallet.load(sender);

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
      userOpHash,
      event.transaction,
      event.receipt,
    );
    // Get the logs from the user operation
    handleUserOperationLogs(userOpHash, event.transaction, event.receipt);

    // Create a new UserOperation entity
    const op = new UserOperation(userOpHash);
    op.index = getUserOpCount();

    // If the function is `handleOps`, deconstruct the calldata
    if (
      // biome-ignore lint/suspicious/noDoubleEquals: <explanation>
      event.transaction.input.toHexString().substring(0, 10) == "0x1fad948c"
    ) {
      const struct = handleUserOperationFromCalldata(
        event.transaction.input.toHexString(),
        nonce,
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

    // Add the user operation to the LightWallet
    lightWallet.userOperations = lightWallet.userOperations.concat([
      userOpHash,
    ]);
    lightWallet.save();

    // -------------------------------------------------------------------------
    // END OF BOILERPLATE
    // -------------------------------------------------------------------------

    const entity = new UserOperationRevertReason(
      event.transaction.hash.concatI32(event.logIndex.toI32()),
    );
    entity.index = getUserOpRevertCount();
    entity.userOpHash = userOpHash;
    entity.sender = sender;
    entity.nonce = nonce;
    entity.revertReason = revertReason;

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;

    // Add the user operation reference to the event
    entity.userOperation = userOpHash;

    entity.save();
  }
}
