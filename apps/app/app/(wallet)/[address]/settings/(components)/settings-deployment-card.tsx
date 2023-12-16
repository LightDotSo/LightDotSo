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

import { getUserOperations } from "@lightdotso/client";
import { CONTRACT_ADDRESSES } from "@lightdotso/const";
import { calculateInitCode } from "@lightdotso/solutions";
import { Button } from "@lightdotso/ui";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import type { FC } from "react";
import type { Address, Chain, Hex } from "viem";
import { SettingsCard } from "@/app/(wallet)/[address]/settings/(components)/settings-card";
import { TITLES } from "@/const/titles";
import type { UserOperationData, WalletSettingsData } from "@/data";
import { queries } from "@/queries";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type SettingsDeploymentCardProps = {
  address: Address;
  chain: string;
  image_hash: Hex;
  salt: Hex;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const SettingsDeploymentCard: FC<SettingsDeploymentCardProps> = ({
  address,
  chain: chain_JSON,
  image_hash,
  salt,
}) => {
  const chain = JSON.parse(chain_JSON) as Chain;

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const walletSettings: WalletSettingsData | undefined =
    queryClient.getQueryData(queries.wallet.settings(address).queryKey);

  const currentData: UserOperationData[] | undefined = queryClient.getQueryData(
    queries.user_operation.list({
      address,
      status: "executed",
      direction: "asc",
      offset: 0,
      limit: Number.MAX_SAFE_INTEGER,
      is_testnet: walletSettings?.is_enabled_testnet ?? false,
    }).queryKey,
  );

  const { data: ops } = useSuspenseQuery<UserOperationData[] | null>({
    queryKey: queries.user_operation.list({
      address,
      status: "executed",
      direction: "asc",
      offset: 0,
      limit: Number.MAX_SAFE_INTEGER,
      is_testnet: walletSettings?.is_enabled_testnet ?? false,
    }).queryKey,
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
            offset: 0,
            is_testnet: walletSettings?.is_enabled_testnet ?? false,
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
    CONTRACT_ADDRESSES["Factory"] as Address,
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
        <Link href={`/${address}/op?userOperations=${chain.id}:${initCode}:_`}>
          {typeof deployed_op !== "undefined" ? "Already Deployed" : "Deploy"}
        </Link>
      </Button>
    );
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <SettingsCard
      address={address}
      title={chain.name}
      subtitle={
        TITLES.Settings.subcategories["Deployment"].subcategories["Chain"]
          .description
      }
      footerContent={<WalletNameFormSubmitButton />}
    >
      {deployed_op && (
        <Button asChild variant="link">
          <a
            target="_blank"
            rel="noreferrer"
            href={`${chain?.blockExplorers?.default.url}/tx/${deployed_op.transaction?.hash}`}
          >
            {deployed_op.transaction?.hash}
          </a>
        </Button>
      )}
      {!deployed_op && (
        <p className="text-sm text-text-weak">
          No deployment found. <br />
        </p>
      )}
    </SettingsCard>
  );
};
