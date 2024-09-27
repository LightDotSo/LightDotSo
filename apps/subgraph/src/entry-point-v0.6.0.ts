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
import {
  AccountDeployed as AccountDeployedEvent,
  UserOperationEvent as UserOperationEventEvent,
  UserOperationRevertReason as UserOperationRevertReasonEvent,
  // Withdrawn as WithdrawnEvent,
} from "../generated/EntryPointv0.6.0/EntryPoint";
import {
  handleLightWalletDeployedGeneric,
  handleLightWalletUserOperationEventGeneric,
  handleLightWalletUserOperationRevertReasonGeneric,
} from "./light-wallet";

// -----------------------------------------------------------------------------
// Handlers
// -----------------------------------------------------------------------------

export function handleAccountDeployed(event: AccountDeployedEvent): void {
  // Handle if the account is LightWallet
  handleLightWalletDeployedGeneric(
    event.params.userOpHash,
    event.params.sender,
    event.params.factory,
    event.params.paymaster,
    event,
  );
}

export function handleUserOperationEvent(event: UserOperationEventEvent): void {
  // Handle if the account is LightWallet
  handleLightWalletUserOperationEventGeneric(
    event.params.userOpHash,
    event.params.sender,
    event.params.paymaster,
    event.params.nonce,
    event.params.success,
    event.params.actualGasCost,
    event.params.actualGasUsed,
    event,
  );
}

export function handleUserOperationRevertReason(
  event: UserOperationRevertReasonEvent,
): void {
  // Handle if the account is LightWallet
  handleLightWalletUserOperationRevertReasonGeneric(
    event.params.userOpHash,
    event.params.sender,
    event.params.nonce,
    event.params.revertReason,
    event,
  );
}
