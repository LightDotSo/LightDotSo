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

// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
import { BigInt } from "@graphprotocol/graph-ts";
import { Counter } from "../generated/schema";

export function getCounter(): Counter {
  let counter = Counter.load("singleton");
  if (counter == null) {
    counter = new Counter("singleton");
    counter.userOpCount = BigInt.fromI32(0);
    counter.userOpRevertCount = BigInt.fromI32(0);
    counter.userOpSuccessCount = BigInt.fromI32(0);
    counter.walletCount = BigInt.fromI32(0);
  }
  return counter;
}

export function getUserOpCount(): BigInt {
  return getCounter().userOpCount;
}

export function getUserOpRevertCount(): BigInt {
  return getCounter().userOpRevertCount;
}

export function getUserOpSuccessCount(): BigInt {
  return getCounter().userOpSuccessCount;
}

export function getWalletCount(): BigInt {
  return getCounter().walletCount;
}

export function incrementUserOpCount(): void {
  const counter = getCounter();
  counter.userOpCount = counter.userOpCount.plus(BigInt.fromI32(1));
  counter.save();
}

export function incrementUserOpRevertCount(): void {
  const counter = getCounter();
  counter.userOpRevertCount = counter.userOpRevertCount.plus(BigInt.fromI32(1));
  counter.save();
}

export function incrementUserOpSuccessCount(): void {
  const counter = getCounter();
  counter.userOpSuccessCount = counter.userOpSuccessCount.plus(
    BigInt.fromI32(1),
  );
  counter.save();
}

export function incrementWalletCount(): void {
  const counter = getCounter();
  counter.walletCount = counter.walletCount.plus(BigInt.fromI32(1));
  counter.save();
}
