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

import { DeployButton } from "./deploy-button";
import { getWallet, getConfiguration } from "@lightdotso/client";
import type { Address, Hex } from "viem";
import { handler } from "@/handles/[address]";

const chains = [
  { name: "Sepolia", chainId: 11155111 },
  { name: "Mainnet", chainId: 1 },
  { name: "Polygon", chainId: 137 },
];

export default async function Page({
  params,
}: {
  params: { address: string };
}) {
  await handler(params);

  let config = (
    await getConfiguration(
      { params: { query: { address: params.address } } },
      false,
    )
  )._unsafeUnwrap();
  let wallet = (
    await getWallet({ params: { query: { address: params.address } } }, false)
  )._unsafeUnwrap();

  if (!config?.data?.image_hash || !wallet?.data?.salt) {
    // Log error
    console.error("Missing image_hash or salt, returning null.");
    // Log the data of the config and wallet
    console.error(config?.data, wallet?.data);
    return null;
  }

  return (
    <div className="space-x-4">
      {chains.map(chain => (
        <DeployButton
          key={chain.name}
          salt={wallet!.data!.salt as Hex}
          image_hash={config!.data!.image_hash as Hex}
          chainId={chain.chainId}
          wallet={params.address as Address}
        >
          {`Deploy to ${chain.name}`}
        </DeployButton>
      ))}
    </div>
  );
}
