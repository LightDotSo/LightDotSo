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

import { SettingsCard } from "@/components/settings/settings-card";
import { TITLES } from "@/const";
import {
  CONTRACT_ADDRESSES,
  ContractAddress,
  LATEST_IMPLEMENTATION_ADDRESS,
  PROXY_IMPLEMENTAION_VERSION_MAPPING,
  WALLET_FACTORY_ENTRYPOINT_MAPPING,
} from "@lightdotso/const";
import { ExternalLink } from "@lightdotso/elements/external-link";
import { useProxyImplementationAddress } from "@lightdotso/hooks";
import { userOperationsParser } from "@lightdotso/nuqs";
import {
  useQueryUserOperations,
  useQueryWallet,
  useQueryWalletSettings,
} from "@lightdotso/query";
import { calculateInitCode } from "@lightdotso/sequence";
import { Button } from "@lightdotso/ui/components/button";
import {
  findContractAddressByAddress,
  getEtherscanUrl,
  shortenAddress,
  shortenBytes32,
} from "@lightdotso/utils";
import {
  lightWalletAbi,
  useReadLightWalletImageHash,
} from "@lightdotso/wagmi/generated";
import { useBytecode } from "@lightdotso/wagmi/wagmi";
import Link from "next/link";
import { type FC, useMemo } from "react";
import { type Address, type Chain, type Hex, encodeFunctionData } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type SettingsDeploymentCardProps = {
  address: Address;
  chain: string;
  // biome-ignore lint/style/useNamingConvention: <explanation>
  image_hash: Hex;
  salt: Hex;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const SettingsDeploymentCard: FC<SettingsDeploymentCardProps> = ({
  address,
  chain: chainJson,
  image_hash,
  salt,
}) => {
  // ---------------------------------------------------------------------------
  // Parse
  // ---------------------------------------------------------------------------

  const chain = JSON.parse(chainJson) as Chain;

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { wallet, isWalletLoading } = useQueryWallet({
    address: address as Address,
  });

  const { walletSettings, isWalletSettingsLoading } = useQueryWalletSettings({
    address: address as Address,
  });

  const { userOperations, isUserOperationsLoading } = useQueryUserOperations({
    address: address as Address,
    status: "history",
    order: "asc",
    offset: 0,
    limit: Number.MAX_SAFE_INTEGER,
    // biome-ignore lint/style/useNamingConvention: <explanation>
    is_testnet: walletSettings?.is_enabled_testnet ?? false,
  });

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const implementationAddress = useProxyImplementationAddress({
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

  // Get the bytecode for the light wallet
  const {
    data: immutableCreate2FactoryBytecode,
    isFetching: isImmutableCreate2FactoryBytecodeFetching,
  } = useBytecode({
    address:
      CONTRACT_ADDRESSES[ContractAddress.IMMUTABLE_CREATE2_FACTORY_ADDRESS],
    chainId: Number(chain.id),
  });

  // ---------------------------------------------------------------------------
  // Local Variables
  // ---------------------------------------------------------------------------

  // Try to extract a matching operation w/ the current chain id
  const deployedOp = userOperations?.find((op) => op.chain_id === chain.id);

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const isLoading = useMemo(() => {
    return (
      (isWalletLoading ||
        isWalletSettingsLoading ||
        isUserOperationsLoading ||
        isImmutableCreate2FactoryBytecodeFetching) &&
      // If the user operation is defined, then we are already loaded
      typeof deployedOp !== "undefined"
    );
  }, [
    isWalletLoading,
    isWalletSettingsLoading,
    isUserOperationsLoading,
    isImmutableCreate2FactoryBytecodeFetching,
    deployedOp,
  ]);

  const isDeployable = useMemo(() => {
    if (!wallet) {
      return false;
    }

    // The v0.1.0 and v0.2.0 factories are the only factories that are deployable through the immutable create2 factory
    if (
      wallet.factory_address ===
        CONTRACT_ADDRESSES[ContractAddress.LIGHT_WALLET_FACTORY_V010_ADDRESS] ||
      wallet.factory_address ===
        CONTRACT_ADDRESSES[ContractAddress.LIGHT_WALLET_FACTORY_V020_ADDRESS]
    ) {
      return (
        immutableCreate2FactoryBytecode &&
        immutableCreate2FactoryBytecode?.length > 0
      );
    }

    // Default to true
    return true;
  }, [wallet, immutableCreate2FactoryBytecode]);

  const implementationVersion = useMemo(() => {
    if (!implementationAddress) {
      return;
    }

    // Get the version of the implementation
    return (
      PROXY_IMPLEMENTAION_VERSION_MAPPING[implementationAddress as Address] ??
      "Unknown"
    );
  }, [implementationAddress]);

  const initCode = useMemo(() => {
    if (!wallet) {
      return;
    }

    // Get the initCode from the initial configuration
    return calculateInitCode(
      WALLET_FACTORY_ENTRYPOINT_MAPPING[
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        findContractAddressByAddress(wallet.factory_address as Address)!
      ],
      image_hash,
      salt,
    );
  }, [image_hash, salt, wallet]);

  const callData = useMemo(() => {
    if (implementationAddress === LATEST_IMPLEMENTATION_ADDRESS) {
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
  }, [implementationAddress, address]);

  const isDisabled = useMemo(() => {
    return isLoading || (deployedOp && callData === "0x") || !isDeployable;
  }, [isLoading, deployedOp, callData, isDeployable]);

  const deployedUserOperation = useMemo(() => {
    return userOperationsParser.serialize([
      {
        chainId: BigInt(chain.id),
        initCode: deployedOp ? "0x" : initCode,
        callData: callData,
      },
    ]);
  }, [initCode, callData, chain.id, deployedOp]);

  // ---------------------------------------------------------------------------
  // Submit Button
  // ---------------------------------------------------------------------------

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
  const SettingsDeploymentCardSubmitButton: FC = () => {
    // -------------------------------------------------------------------------
    // Local Variables
    // -------------------------------------------------------------------------

    const buttonContent = isLoading
      ? "Loading..."
      : typeof deployedOp !== "undefined"
        ? callData === "0x"
          ? "Already Deployed"
          : "Upgrade"
        : isDeployable
          ? "Deploy"
          : "Not Deployable";

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    if (isLoading || isDisabled) {
      return (
        <Button disabled={isDisabled} isLoading={isLoading}>
          {buttonContent}
        </Button>
      );
    }

    return (
      <Button asChild type="submit" form="settings-deployment-card-form">
        <Link
          href={`/${address}/create?userOperations=${deployedUserOperation}`}
        >
          {buttonContent}
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
        TITLES.WalletSettings.subcategories.Deployment.subcategories.Chain
          .description
      }
      chainId={chain.id}
      footerContent={<SettingsDeploymentCardSubmitButton />}
    >
      {deployedOp && implementationAddress && (
        <div className="flex items-center gap-2">
          Version: {implementationVersion}
          <span className="text-sm text-text-weak">
            {shortenAddress(implementationAddress)}
          </span>
        </div>
      )}
      {deployedOp && imageHash && (
        <div className="flex items-center gap-2">
          Hash:
          <span className="text-sm text-text-weak">
            {shortenBytes32(imageHash)}
          </span>
        </div>
      )}
      <div className="flex flex-row items-center">
        {deployedOp?.transaction?.hash && (
          <div className="flex items-center gap-2">
            Tx:{" "}
            <ExternalLink
              className="text-sm text-text-weak hover:text-text-weaker hover:underline"
              href={`${getEtherscanUrl(chain)}/tx/${deployedOp.transaction?.hash}`}
            >
              {shortenBytes32(deployedOp.transaction?.hash)}
            </ExternalLink>
          </div>
        )}
        {!deployedOp && (
          <p className="text-sm text-text-weak">
            No deployment found. <br />
          </p>
        )}
      </div>
    </SettingsCard>
  );
};
