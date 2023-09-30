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
  let counter = getCounter();
  counter.userOpCount = counter.userOpCount.plus(BigInt.fromI32(1));
  counter.save();
}

export function incrementUserOpRevertCount(): void {
  let counter = getCounter();
  counter.userOpRevertCount = counter.userOpRevertCount.plus(BigInt.fromI32(1));
  counter.save();
}

export function incrementUserOpSuccessCount(): void {
  let counter = getCounter();
  counter.userOpSuccessCount = counter.userOpSuccessCount.plus(
    BigInt.fromI32(1),
  );
  counter.save();
}

export function incrementWalletCount(): void {
  let counter = getCounter();
  counter.walletCount = counter.walletCount.plus(BigInt.fromI32(1));
  counter.save();
}
