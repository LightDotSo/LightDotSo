// Copyright 2023-2024 Light, Inc.
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

"use client";

import { CONTRACT_ADDRESSES } from "@lightdotso/const";
import { userOperationsParser } from "@lightdotso/nuqs";
import {
  useQueryUserOperations,
  useQueryWalletSettings,
} from "@lightdotso/query";
import { calculateInitCode } from "@lightdotso/sequence";
import { Button } from "@lightdotso/ui";
import { getEtherscanUrl } from "@lightdotso/utils";
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

  const { walletSettings } = useQueryWalletSettings({
    address,
  });

  const { userOperations } = useQueryUserOperations({
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
        form="settings-deployment-card-form"
        disabled={typeof deployed_op !== "undefined"}
      >
        <Link
          href={`/${address}/create?userOperations=${userOperationsParser.serialize([{ chainId: BigInt(chain.id), initCode: initCode }])}`}
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
        TITLES.WalletSettings.subcategories["Deployment"].subcategories["Chain"]
          .description
      }
      footerContent={<SettingsDeploymentCardSubmitButton />}
    >
      {deployed_op && (
        <Button asChild variant="link">
          <a
            target="_blank"
            rel="noreferrer"
            href={`${getEtherscanUrl(chain)}/tx/${deployed_op.transaction?.hash}`}
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
