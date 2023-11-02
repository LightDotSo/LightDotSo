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

import { Bytes } from "@graphprotocol/graph-ts";
import {
  AccountDeployed as AccountDeployedEvent,
  UserOperationEvent as UserOperationEventEvent,
  UserOperationRevertReason as UserOperationRevertReasonEvent,
} from "../generated/EntryPointv0.6.0/EntryPoint";
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
import { handleUserOperationTransaction } from "./transaction";
import { handleUserOperationFromCalldata } from "./user-operation";
import { handleUserOperationLogs } from "./log";

export function handleLightWalletDeployed(event: AccountDeployedEvent): void {
  // If the event is emitted by one of the factories, then we know that the account is a LightWallet
  // If it is one of the factories, the index will be greater than -1
  // If it is not one of the factories, the index will be -1
  if (lightWalletFactories.indexOf(event.params.factory) > -1) {
    // Increment the wallet count
    incrementWalletCount();

    // Create a new LightWallet entity
    let lightWallet = new LightWallet(event.params.sender);
    lightWallet.index = getWalletCount();
    lightWallet.address = event.params.sender;

    lightWallet.userOpHash = event.params.userOpHash;
    lightWallet.sender = event.params.sender;
    lightWallet.factory = event.params.factory;
    lightWallet.paymaster = event.params.paymaster;

    lightWallet.blockNumber = event.block.number;
    lightWallet.blockTimestamp = event.block.timestamp;
    lightWallet.transactionHash = event.transaction.hash;

    // Get the image hash of the LightWallet
    let wallet = LightWaletInterface.bind(event.params.sender);
    let try_imageHash = wallet.try_imageHash();
    lightWallet.imageHash = try_imageHash.reverted
      ? new Bytes(0)
      : try_imageHash.value;

    lightWallet.save();
  }
}

export function handleLightWalletUserOperationEvent(
  event: UserOperationEventEvent,
): void {
  // Get the LightWallet entity
  let lightWallet = LightWallet.load(event.params.sender);

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
    let transaction = handleUserOperationTransaction(
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
    op.blockNumber = event.block.number;
    op.blockTimestamp = event.block.timestamp;
    op.transactionHash = event.transaction.hash;

    op.entryPoint = event.address;

    op.save();

    // Add the user operation to the Transaction
    if (transaction.userOperations == null) {
      transaction.userOperations = [event.params.userOpHash];
    } else {
      transaction.userOperations!.push(event.params.userOpHash);
    }
    transaction.save();

    // Add the user operation to the LightWallet
    if (lightWallet.userOperations == null) {
      lightWallet.userOperations = [event.params.userOpHash];
    } else {
      lightWallet.userOperations!.push(event.params.userOpHash);
    }
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

export function handleLightWalletUserOperationRevertReason(
  event: UserOperationRevertReasonEvent,
): void {
  // Get the LightWallet entity
  let lightWallet = LightWallet.load(event.params.sender);

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
    let transaction = handleUserOperationTransaction(
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
    op.blockNumber = event.block.number;
    op.blockTimestamp = event.block.timestamp;
    op.transactionHash = event.transaction.hash;

    op.entryPoint = event.address;

    op.save();

    // Add the user operation to the Transaction
    if (transaction.userOperations == null) {
      transaction.userOperations = [event.params.userOpHash];
    } else {
      transaction.userOperations!.push(event.params.userOpHash);
    }
    transaction.save();

    // Add the user operation to the LightWallet
    if (lightWallet.userOperations == null) {
      lightWallet.userOperations = [event.params.userOpHash];
    } else {
      lightWallet.userOperations!.push(event.params.userOpHash);
    }
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
