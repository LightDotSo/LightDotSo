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

import { TransactionDialog } from "@/components/transaction-dialog";
import { DeployButton } from "./deploy-button";
import { getWallet, getConfiguration } from "@lightdotso/client";
import type { Hex } from "viem";

const chains = [
  { name: "Sepolia", chainId: undefined },
  { name: "Mainnet", chainId: 1 },
  { name: "Polygon", chainId: 137 },
];

export default async function Page({
  params: { address },
}: {
  params: { address: string };
}) {
  let config = (
    await getConfiguration({ params: { query: { address } } }, false)
  )._unsafeUnwrap();
  let wallet = (
    await getWallet({ params: { query: { address } } }, false)
  )._unsafeUnwrap();

  if (!config?.data?.image_hash || !wallet?.data?.salt) return;

  return (
    <TransactionDialog>
      <div className="space-x-4">
        {chains.map(chain => (
          <DeployButton
            key={chain.name}
            salt={wallet!.data!.salt as Hex}
            image_hash={config!.data!.image_hash as Hex}
            chainId={chain.chainId}
          >
            {`Deploy to ${chain.name}`}
          </DeployButton>
        ))}
      </div>
    </TransactionDialog>
  );
}
