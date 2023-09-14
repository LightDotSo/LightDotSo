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

import { newMockEvent } from "matchstick-as";
import type { Bytes, Address, BigInt } from "@graphprotocol/graph-ts";
import { ethereum } from "@graphprotocol/graph-ts";
import type {
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
} from "../generated/EntryPoint/EntryPoint";

export function createAccountDeployedEvent(
  userOpHash: Bytes,
  sender: Address,
  factory: Address,
  paymaster: Address,
): AccountDeployed {
  let accountDeployedEvent = changetype<AccountDeployed>(newMockEvent());

  accountDeployedEvent.parameters = new Array();

  accountDeployedEvent.parameters.push(
    new ethereum.EventParam(
      "userOpHash",
      ethereum.Value.fromFixedBytes(userOpHash),
    ),
  );
  accountDeployedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender)),
  );
  accountDeployedEvent.parameters.push(
    new ethereum.EventParam("factory", ethereum.Value.fromAddress(factory)),
  );
  accountDeployedEvent.parameters.push(
    new ethereum.EventParam("paymaster", ethereum.Value.fromAddress(paymaster)),
  );

  return accountDeployedEvent;
}

export function createBeforeExecutionEvent(): BeforeExecution {
  let beforeExecutionEvent = changetype<BeforeExecution>(newMockEvent());

  beforeExecutionEvent.parameters = new Array();

  return beforeExecutionEvent;
}

export function createDepositedEvent(
  account: Address,
  totalDeposit: BigInt,
): Deposited {
  let depositedEvent = changetype<Deposited>(newMockEvent());

  depositedEvent.parameters = new Array();

  depositedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account)),
  );
  depositedEvent.parameters.push(
    new ethereum.EventParam(
      "totalDeposit",
      ethereum.Value.fromUnsignedBigInt(totalDeposit),
    ),
  );

  return depositedEvent;
}

export function createSignatureAggregatorChangedEvent(
  aggregator: Address,
): SignatureAggregatorChanged {
  let signatureAggregatorChangedEvent = changetype<SignatureAggregatorChanged>(
    newMockEvent(),
  );

  signatureAggregatorChangedEvent.parameters = new Array();

  signatureAggregatorChangedEvent.parameters.push(
    new ethereum.EventParam(
      "aggregator",
      ethereum.Value.fromAddress(aggregator),
    ),
  );

  return signatureAggregatorChangedEvent;
}

export function createStakeLockedEvent(
  account: Address,
  totalStaked: BigInt,
  unstakeDelaySec: BigInt,
): StakeLocked {
  let stakeLockedEvent = changetype<StakeLocked>(newMockEvent());

  stakeLockedEvent.parameters = new Array();

  stakeLockedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account)),
  );
  stakeLockedEvent.parameters.push(
    new ethereum.EventParam(
      "totalStaked",
      ethereum.Value.fromUnsignedBigInt(totalStaked),
    ),
  );
  stakeLockedEvent.parameters.push(
    new ethereum.EventParam(
      "unstakeDelaySec",
      ethereum.Value.fromUnsignedBigInt(unstakeDelaySec),
    ),
  );

  return stakeLockedEvent;
}

export function createStakeUnlockedEvent(
  account: Address,
  withdrawTime: BigInt,
): StakeUnlocked {
  let stakeUnlockedEvent = changetype<StakeUnlocked>(newMockEvent());

  stakeUnlockedEvent.parameters = new Array();

  stakeUnlockedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account)),
  );
  stakeUnlockedEvent.parameters.push(
    new ethereum.EventParam(
      "withdrawTime",
      ethereum.Value.fromUnsignedBigInt(withdrawTime),
    ),
  );

  return stakeUnlockedEvent;
}

export function createStakeWithdrawnEvent(
  account: Address,
  withdrawAddress: Address,
  amount: BigInt,
): StakeWithdrawn {
  let stakeWithdrawnEvent = changetype<StakeWithdrawn>(newMockEvent());

  stakeWithdrawnEvent.parameters = new Array();

  stakeWithdrawnEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account)),
  );
  stakeWithdrawnEvent.parameters.push(
    new ethereum.EventParam(
      "withdrawAddress",
      ethereum.Value.fromAddress(withdrawAddress),
    ),
  );
  stakeWithdrawnEvent.parameters.push(
    new ethereum.EventParam(
      "amount",
      ethereum.Value.fromUnsignedBigInt(amount),
    ),
  );

  return stakeWithdrawnEvent;
}

export function createUserOperationEventEvent(
  userOpHash: Bytes,
  sender: Address,
  paymaster: Address,
  nonce: BigInt,
  success: boolean,
  actualGasCost: BigInt,
  actualGasUsed: BigInt,
): UserOperationEvent {
  let userOperationEventEvent = changetype<UserOperationEvent>(newMockEvent());

  userOperationEventEvent.parameters = new Array();

  userOperationEventEvent.parameters.push(
    new ethereum.EventParam(
      "userOpHash",
      ethereum.Value.fromFixedBytes(userOpHash),
    ),
  );
  userOperationEventEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender)),
  );
  userOperationEventEvent.parameters.push(
    new ethereum.EventParam("paymaster", ethereum.Value.fromAddress(paymaster)),
  );
  userOperationEventEvent.parameters.push(
    new ethereum.EventParam("nonce", ethereum.Value.fromUnsignedBigInt(nonce)),
  );
  userOperationEventEvent.parameters.push(
    new ethereum.EventParam("success", ethereum.Value.fromBoolean(success)),
  );
  userOperationEventEvent.parameters.push(
    new ethereum.EventParam(
      "actualGasCost",
      ethereum.Value.fromUnsignedBigInt(actualGasCost),
    ),
  );
  userOperationEventEvent.parameters.push(
    new ethereum.EventParam(
      "actualGasUsed",
      ethereum.Value.fromUnsignedBigInt(actualGasUsed),
    ),
  );

  return userOperationEventEvent;
}

export function createUserOperationRevertReasonEvent(
  userOpHash: Bytes,
  sender: Address,
  nonce: BigInt,
  revertReason: Bytes,
): UserOperationRevertReason {
  let userOperationRevertReasonEvent = changetype<UserOperationRevertReason>(
    newMockEvent(),
  );

  userOperationRevertReasonEvent.parameters = new Array();

  userOperationRevertReasonEvent.parameters.push(
    new ethereum.EventParam(
      "userOpHash",
      ethereum.Value.fromFixedBytes(userOpHash),
    ),
  );
  userOperationRevertReasonEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender)),
  );
  userOperationRevertReasonEvent.parameters.push(
    new ethereum.EventParam("nonce", ethereum.Value.fromUnsignedBigInt(nonce)),
  );
  userOperationRevertReasonEvent.parameters.push(
    new ethereum.EventParam(
      "revertReason",
      ethereum.Value.fromBytes(revertReason),
    ),
  );

  return userOperationRevertReasonEvent;
}

export function createWithdrawnEvent(
  account: Address,
  withdrawAddress: Address,
  amount: BigInt,
): Withdrawn {
  let withdrawnEvent = changetype<Withdrawn>(newMockEvent());

  withdrawnEvent.parameters = new Array();

  withdrawnEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account)),
  );
  withdrawnEvent.parameters.push(
    new ethereum.EventParam(
      "withdrawAddress",
      ethereum.Value.fromAddress(withdrawAddress),
    ),
  );
  withdrawnEvent.parameters.push(
    new ethereum.EventParam(
      "amount",
      ethereum.Value.fromUnsignedBigInt(amount),
    ),
  );

  return withdrawnEvent;
}
