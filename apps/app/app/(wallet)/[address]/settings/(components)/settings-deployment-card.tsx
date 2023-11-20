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

"use client";

import { Button } from "@lightdotso/ui";
import { getUserOperations } from "@lightdotso/client";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import type { FC } from "react";
import { SettingsCard } from "@/app/(wallet)/[address]/settings/(components)/settings-card";
import { TITLES } from "@/const/titles";
import type { Address, Chain, Hex } from "viem";
import { ContractLinks } from "@lightdotso/const";
import { calculateInitCode } from "@lightdotso/solutions";
import Link from "next/link";

// -----------------------------------------------------------------------------
// Data
// -----------------------------------------------------------------------------

type UserOperationData = {
  call_data: string;
  call_gas_limit: number;
  chain_id: number;
  hash: string;
  init_code: string;
  max_fee_per_gas: number;
  max_priority_fee_per_gas: number;
  nonce: number;
  paymaster?: {
    address: string;
    sender: string;
    sender_nonce: number;
  } | null;
  paymaster_and_data: string;
  pre_verification_gas: number;
  sender: string;
  signatures: {
    owner_id: string;
    signature: string;
    signature_type: number;
  }[];
  status: string;
  transaction?: {
    hash: string;
  } | null;
  verification_gas_limit: number;
}[];

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type SettingsDeploymentCardProps = {
  address: string;
  chain: Chain;
  image_hash: Hex;
  salt: Hex;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const SettingsDeploymentCard: FC<SettingsDeploymentCardProps> = ({
  address,
  chain,
  image_hash,
  salt,
}) => {
  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const currentData: UserOperationData | undefined =
    useQueryClient().getQueryData([
      "user_operations",
      "executed",
      "asc",
      Number.MAX_SAFE_INTEGER,
      address,
    ]);

  const { data: ops } = useSuspenseQuery<UserOperationData | null>({
    queryKey: [
      "user_operations",
      "executed",
      "asc",
      Number.MAX_SAFE_INTEGER,
      address,
    ],
    queryFn: async () => {
      if (!address) {
        return null;
      }

      const res = await getUserOperations({
        params: {
          query: {
            address: address,
            status: "executed",
            direction: "asc",
            limit: Number.MAX_SAFE_INTEGER,
          },
        },
      });

      // Return if the response is 200
      return res.match(
        data => {
          return data;
        },
        _ => {
          return currentData ?? null;
        },
      );
    },
  });

  // Try to extract a matching operation w/ the current chain id
  const deployed_op = ops?.find(op => op.chain_id === chain.id);

  // ---------------------------------------------------------------------------
  // Button
  // ---------------------------------------------------------------------------

  let initCode = calculateInitCode(
    ContractLinks["Factory"] as Address,
    image_hash,
    salt,
  );

  const WalletNameFormSubmitButton: FC = () => {
    return (
      <Button
        type="submit"
        form="walletNameForm"
        disabled={typeof deployed_op !== "undefined"}
      >
        <Link href={`/${address}/op/${chain.id}?initCode=${initCode}`}>
          Deploy
        </Link>
      </Button>
    );
  };

  // ---------------------------------------------------------------------------
  // Card
  // ---------------------------------------------------------------------------

  return (
    <SettingsCard
      address={address}
      title={
        TITLES.Settings.subcategories["Wallet Settings"].subcategories["Name"]
          .title
      }
      subtitle={
        TITLES.Settings.subcategories["Wallet Settings"].subcategories["Name"]
          .description
      }
      footerContent={<WalletNameFormSubmitButton />}
    >
      {deployed_op && (
        <Button asChild>
          <a
            target="_blank"
            rel="noreferrer"
            href={`${chain?.blockExplorers?.default.url}/tx/${deployed_op.transaction?.hash}`}
          >
            {deployed_op.transaction?.hash}
          </a>
        </Button>
      )}
    </SettingsCard>
  );
};
