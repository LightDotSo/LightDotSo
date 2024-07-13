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

"use client";

import {
  LATEST_IMPLEMENTATION_ADDRESS,
  PROXY_IMPLEMENTAION_VERSION_MAPPING,
  WALLET_FACTORY_ENTRYPOINT_MAPPING,
} from "@lightdotso/const";
import { useProxyImplementationAddress } from "@lightdotso/hooks";
import { userOperationsParser } from "@lightdotso/nuqs";
import {
  useQueryUserOperations,
  useQueryWallet,
  useQueryWalletSettings,
} from "@lightdotso/query";
import { calculateInitCode } from "@lightdotso/sequence";
import { Button } from "@lightdotso/ui";
import {
  findContractAddressByAddress,
  getEtherscanUrl,
  shortenAddress,
  shortenBytes32,
} from "@lightdotso/utils";
import { lightWalletAbi, useReadLightWalletImageHash } from "@lightdotso/wagmi";
import Link from "next/link";
import { useMemo, type FC } from "react";
import { encodeFunctionData, type Address, type Chain, type Hex } from "viem";
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

  const { wallet } = useQueryWallet({
    address: address as Address,
  });

  const { walletSettings } = useQueryWalletSettings({
    address: address as Address,
  });

  const { userOperations } = useQueryUserOperations({
    address: address as Address,
    status: "history",
    order: "asc",
    offset: 0,
    limit: Number.MAX_SAFE_INTEGER,
    is_testnet: walletSettings?.is_enabled_testnet ?? false,
  });

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const implAddress = useProxyImplementationAddress({
    address: address as Address,
    chainId: chain.id,
  });

  // ---------------------------------------------------------------------------
  // Wagmi
  // ---------------------------------------------------------------------------

  const { data: imageHash } = useReadLightWalletImageHash({
    address: address as Address,
    chainId: Number(chain.id),
  });

  // ---------------------------------------------------------------------------
  // Local Variables
  // ---------------------------------------------------------------------------

  // Try to extract a matching operation w/ the current chain id
  const deployed_op = userOperations?.find(op => op.chain_id === chain.id);

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const implVersion = useMemo(() => {
    if (!implAddress) {
      return;
    }

    // Get the version of the implementation
    return (
      PROXY_IMPLEMENTAION_VERSION_MAPPING[implAddress as Address] ?? "Unknown"
    );
  }, [implAddress]);

  const initCode = useMemo(() => {
    if (!wallet) {
      return;
    }

    // Get the initCode from the initial configuration
    return calculateInitCode(
      WALLET_FACTORY_ENTRYPOINT_MAPPING[
        findContractAddressByAddress(wallet.factory_address as Address)!
      ],
      image_hash,
      salt,
    );
  }, [image_hash, salt, wallet]);

  const callData = useMemo(() => {
    if (implAddress === LATEST_IMPLEMENTATION_ADDRESS) {
      return "0x";
    }

    // Upgrade to the latest implementation
    return encodeFunctionData({
      abi: lightWalletAbi,
      functionName: "execute",
      args: [
        address,
        BigInt(0),
        encodeFunctionData({
          abi: [
            {
              inputs: [
                {
                  internalType: "address",
                  name: "newImplementation",
                  type: "address",
                },
              ],
              name: "upgradeTo",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
          ],
          args: [LATEST_IMPLEMENTATION_ADDRESS],
        }),
      ],
    });
  }, [implAddress, address]);

  const deployedUserOperation = useMemo(() => {
    return userOperationsParser.serialize([
      {
        chainId: BigInt(chain.id),
        initCode: !deployed_op ? initCode : "0x",
        callData: callData,
      },
    ]);
  }, [initCode, callData, chain.id, deployed_op]);

  // ---------------------------------------------------------------------------
  // Submit Button
  // ---------------------------------------------------------------------------

  const SettingsDeploymentCardSubmitButton: FC = () => {
    return (
      <Button
        type="submit"
        form="settings-deployment-card-form"
        disabled={deployed_op && callData === "0x"}
      >
        <Link
          href={`/${address}/create?userOperations=${deployedUserOperation}`}
        >
          {typeof deployed_op !== "undefined"
            ? callData === "0x"
              ? "Already Deployed"
              : "Upgrade"
            : "Deploy"}
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
      chainId={chain.id}
      footerContent={<SettingsDeploymentCardSubmitButton />}
    >
      {deployed_op && implAddress && (
        <div className="flex items-center gap-2">
          Version: {implVersion}
          <span className="text-sm text-text-weak">
            {shortenAddress(implAddress)}
          </span>
        </div>
      )}
      {deployed_op && imageHash && (
        <div className="flex items-center gap-2">
          Hash:
          <span className="text-sm text-text-weak">
            {shortenBytes32(imageHash)}
          </span>
        </div>
      )}
      <div className="flex flex-row items-center">
        {deployed_op && deployed_op.transaction?.hash && (
          <div className="flex items-center gap-2">
            Tx:{" "}
            <a
              className="text-sm text-text-weak hover:underline"
              target="_blank"
              rel="noreferrer"
              href={`${getEtherscanUrl(chain)}/tx/${deployed_op.transaction?.hash}`}
            >
              {shortenBytes32(deployed_op.transaction?.hash)}
            </a>
          </div>
        )}
        {!deployed_op && (
          <p className="text-sm text-text-weak">
            No deployment found. <br />
          </p>
        )}
      </div>
    </SettingsCard>
  );
};
