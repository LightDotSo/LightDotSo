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

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import {
  AccountDeployed as AccountDeployedEvent,
  BeforeExecution as BeforeExecutionEvent,
  Deposited as DepositedEvent,
  SignatureAggregatorChanged as SignatureAggregatorChangedEvent,
  StakeLocked as StakeLockedEvent,
  StakeUnlocked as StakeUnlockedEvent,
  StakeWithdrawn as StakeWithdrawnEvent,
  UserOperationEvent as UserOperationEventEvent,
  UserOperationRevertReason as UserOperationRevertReasonEvent,
  Withdrawn as WithdrawnEvent,
} from "../generated/EntryPoint/EntryPoint";
import {
  AccountDeployed,
  BeforeExecution,
  Deposited,
  SignatureAggregatorChanged,
  StakeLocked,
  StakeUnlocked,
  StakeWithdrawn,
  UserOperationEvent,
  UserOperationRevertReason,
  Withdrawn,
} from "../generated/schema";

export function handleAccountDeployed(event: AccountDeployedEvent): void {
  let entity = new AccountDeployed(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.userOpHash = event.params.userOpHash;
  entity.sender = event.params.sender;
  entity.factory = event.params.factory;
  entity.paymaster = event.params.paymaster;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleBeforeExecution(event: BeforeExecutionEvent): void {
  let entity = new BeforeExecution(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleDeposited(event: DepositedEvent): void {
  let entity = new Deposited(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.account = event.params.account;
  entity.totalDeposit = event.params.totalDeposit;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleSignatureAggregatorChanged(
  event: SignatureAggregatorChangedEvent,
): void {
  let entity = new SignatureAggregatorChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.aggregator = event.params.aggregator;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleStakeLocked(event: StakeLockedEvent): void {
  let entity = new StakeLocked(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.account = event.params.account;
  entity.totalStaked = event.params.totalStaked;
  entity.unstakeDelaySec = event.params.unstakeDelaySec;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleStakeUnlocked(event: StakeUnlockedEvent): void {
  let entity = new StakeUnlocked(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.account = event.params.account;
  entity.withdrawTime = event.params.withdrawTime;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleStakeWithdrawn(event: StakeWithdrawnEvent): void {
  let entity = new StakeWithdrawn(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.account = event.params.account;
  entity.withdrawAddress = event.params.withdrawAddress;
  entity.amount = event.params.amount;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleUserOperationEvent(event: UserOperationEventEvent): void {
  let entity = new UserOperationEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
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

  entity.save();
}

export function handleUserOperationRevertReason(
  event: UserOperationRevertReasonEvent,
): void {
  let entity = new UserOperationRevertReason(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.userOpHash = event.params.userOpHash;
  entity.sender = event.params.sender;
  entity.nonce = event.params.nonce;
  entity.revertReason = event.params.revertReason;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleWithdrawn(event: WithdrawnEvent): void {
  let entity = new Withdrawn(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.account = event.params.account;
  entity.withdrawAddress = event.params.withdrawAddress;
  entity.amount = event.params.amount;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}
