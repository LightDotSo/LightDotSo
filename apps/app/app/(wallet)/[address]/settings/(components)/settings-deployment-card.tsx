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

import { CONTRACT_ADDRESSES } from "@lightdotso/const";
import type { WalletSettingsData } from "@lightdotso/data";
import { userOperationsParser } from "@lightdotso/nuqs";
import { useSuspenseQueryUserOperations } from "@lightdotso/query";
import { queryKeys } from "@lightdotso/query-keys";
import { calculateInitCode } from "@lightdotso/solutions";
import { Button } from "@lightdotso/ui";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import type { FC } from "react";
import type { Address, Chain, Hex } from "viem";
import { SettingsCard } from "@/components/settings/settings-card";
import { TITLES } from "@/const";

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
  // ---------------------------------------------------------------------------
  // Parse
  // ---------------------------------------------------------------------------

  const chain = JSON.parse(chain_JSON) as Chain;

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const walletSettings: WalletSettingsData | undefined =
    queryClient.getQueryData(queryKeys.wallet.settings({ address }).queryKey);

  const { userOperations } = useSuspenseQueryUserOperations({
    address,
    status: "history",
    order: "asc",
    offset: 0,
    limit: Number.MAX_SAFE_INTEGER,
    is_testnet: walletSettings?.is_enabled_testnet ?? false,
  });

  // ---------------------------------------------------------------------------
  // Local Variables
  // ---------------------------------------------------------------------------

  // Try to extract a matching operation w/ the current chain id
  const deployed_op = userOperations?.find(op => op.chain_id === chain.id);

  let initCode = calculateInitCode(
    CONTRACT_ADDRESSES["Factory"] as Address,
    image_hash,
    salt,
  );

  // ---------------------------------------------------------------------------
  // Submit Button
  // ---------------------------------------------------------------------------

  const SettingsDeploymentCardSubmitButton: FC = () => {
    return (
      <Button
        type="submit"
        form="walletNameForm"
        disabled={typeof deployed_op !== "undefined"}
      >
        <Link
          href={`/${address}/op?userOperations=${userOperationsParser.serialize([{ chainId: BigInt(chain.id), initCode: initCode }])}`}
        >
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
      title={chain.name}
      subtitle={
        TITLES.Settings.subcategories["Deployment"].subcategories["Chain"]
          .description
      }
      footerContent={<SettingsDeploymentCardSubmitButton />}
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
