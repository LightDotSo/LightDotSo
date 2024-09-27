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
  Deposit as DepositEvent,
  EpochEnd as EpochEndEvent,
  Withdraw as WithdrawEvent,
} from "../generated/LightVaultv0.1.0/LightVault";
import { LightVault } from "../generated/schema";
import { incrementVaultCount } from "./counter";

// -----------------------------------------------------------------------------
// Handlers
// -----------------------------------------------------------------------------

export function handleDeposit(event: DepositEvent): void {
  // Get the LightVault entity
  const lightVault = LightVault.load(event.address);

  // Handle if the vault exists
  if (lightVault != null) {
    // Increment the vault count
    incrementVaultCount();
  }
}

export function handleWithdraw(event: WithdrawEvent): void {
  // Get the LightVault entity
  const lightVault = LightVault.load(event.address);

  // Handle if the vault exists
  if (lightVault != null) {
    // Increment the vault count
    incrementVaultCount();
  }
}

export function handleEpochEnd(event: EpochEndEvent): void {
  const fees = event.params.fees;
  const returnedAssets = event.params.returnedAssets;
  const lastSavedBalance = event.params.lastSavedBalance;

  // biome-ignore lint/suspicious/noConsoleLog: <explanation>
  // biome-ignore lint/suspicious/noConsole: <explanation>
  console.log(`fees: ${fees.toString()}`);
  // biome-ignore lint/suspicious/noConsoleLog: <explanation>
  // biome-ignore lint/suspicious/noConsole: <explanation>
  console.log(`returnedAssets: ${returnedAssets.toString()}`);
  // biome-ignore lint/suspicious/noConsoleLog: <explanation>
  // biome-ignore lint/suspicious/noConsole: <explanation>
  console.log(`lastSavedBalance: ${lastSavedBalance.toString()}`);
}
