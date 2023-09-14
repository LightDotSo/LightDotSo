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

import { Address, Bytes } from "@graphprotocol/graph-ts";
import { AccountDeployed as AccountDeployedEvent } from "../generated/EntryPointv0.6.0/EntryPoint";
import { LightWallet as LightWaletInterface } from "../generated/EntryPointv0.6.0/LightWallet";
import { AccountDeployed, LightWallet } from "../generated/schema";

export function handleLightWalletDeployed(event: AccountDeployedEvent): void {
  // If the event is emitted by one of the factories, then we know that the account is a LightWallet
  if (
    event.params.factory ==
    Address.fromString("0x0000000000756D3E6464f5efe7e413a0Af1C7474")
  ) {
    // Create a new AccountDeployed entity
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

    // Create a new LightWallet entity
    let lightWallet = new LightWallet(event.params.userOpHash);
    lightWallet.address = event.address;
    lightWallet.factory = event.params.factory;
    lightWallet.userOpHash = event.params.userOpHash;
    lightWallet.blockNumber = event.block.number;
    lightWallet.blockTimestamp = event.block.timestamp;
    lightWallet.transactionHash = event.transaction.hash;

    // Get the image hash of the LightWallet
    let wallet = LightWaletInterface.bind(event.address);
    let try_imageHash = wallet.try_imageHash();
    lightWallet.imageHash = try_imageHash.reverted
      ? new Bytes(0)
      : try_imageHash.value;

    lightWallet.save();
  }
}
