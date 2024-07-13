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

import type { ConfigurationOperationCreateBodyParams } from "@lightdotso/params";
import {
  useQueryConfiguration,
  useMutationConfigurationOperationCreate,
  useQueryConfigurationOperationSimulation,
} from "@lightdotso/query";
import { hashSetImageHash, subdigestOf } from "@lightdotso/sequence";
import { useAuth } from "@lightdotso/stores";
import { useSignMessage } from "@lightdotso/wagmi";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Address, Hex } from "viem";
import { isAddressEqual, toBytes } from "viem";

// -----------------------------------------------------------------------------
// Hook Props
// -----------------------------------------------------------------------------

type ConfigurationOperationCreateProps = {
  address: Address;
  params: Omit<ConfigurationOperationCreateBodyParams, "signedData">;
};

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useConfigurationOperationCreate = ({
  address,
  params,
}: ConfigurationOperationCreateProps) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { address: userAddress } = useAuth();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { configuration } = useQueryConfiguration({
    address: address as Address,
  });

  const {
    configurationOperationSimulation,
    isConfigurationOperationSimulationLoading,
    refetchConfigurationOperationSimulation,
  } = useQueryConfigurationOperationSimulation({
    address: address as Address,
    threshold: params.threshold,
    ownerId: params.ownerId,
    owners: params.owners,
  });

  const { configurationOperationCreate } =
    useMutationConfigurationOperationCreate({
      address: address as Address,
      simulate: false,
    });

  // ---------------------------------------------------------------------------
  // State Hooks
  // ---------------------------------------------------------------------------

  const [signedData, setSignedData] = useState<Hex>();

  // ---------------------------------------------------------------------------
  // Local Variables
  // ---------------------------------------------------------------------------

  const subdigest = useMemo(() => {
    if (
      !address ||
      !configurationOperationSimulation?.image_hash ||
      isConfigurationOperationSimulationLoading
    ) {
      return;
    }

    console.info(
      "configurationOperationSimulation:",
      configurationOperationSimulation,
    );

    return subdigestOf(
      address,
      toBytes(
        hashSetImageHash(configurationOperationSimulation?.image_hash as Hex),
      ),
      BigInt(0),
    );
  }, [
    address,
    configurationOperationSimulation,
    isConfigurationOperationSimulationLoading,
  ]);

  // ---------------------------------------------------------------------------
  // Wagmi
  // ---------------------------------------------------------------------------

  const { data, signMessage } = useSignMessage();

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const owner = useMemo(() => {
    if (!userAddress) {
      return;
    }

    return configuration?.owners?.find(owner =>
      isAddressEqual(owner.address as Address, userAddress),
    );
  }, [configuration?.owners, userAddress]);

  // ---------------------------------------------------------------------------
  // Callback Hooks
  // ---------------------------------------------------------------------------

  const signConfigurationOperation = useCallback(() => {
    if (!subdigest) {
      return;
    }

    signMessage({ message: { raw: toBytes(subdigest) } });
  }, [subdigest, signMessage]);

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  // Refetch the simulation when the parameters change
  useEffect(() => {
    refetchConfigurationOperationSimulation();
  }, [params, refetchConfigurationOperationSimulation]);

  // Sync the signed data
  useEffect(() => {
    if (!data) {
      return;
    }

    setSignedData(data);
  }, [data]);

  useEffect(() => {
    const createConfigurationOp = async () => {
      if (!owner || !signedData || !params) {
        return;
      }

      await configurationOperationCreate({
        ownerId: owner.id,
        signedData: signedData as Hex,
        owners: params?.owners,
        threshold: params?.threshold,
      });

      setSignedData(undefined);
    };

    createConfigurationOp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signedData, owner, configuration?.threshold, address, params]);

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const isConfigurationOperationCreatable = useMemo(() => {
    return typeof owner !== "undefined";
  }, [owner]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return {
    isConfigurationOperationCreatable: isConfigurationOperationCreatable,
    signConfigurationOperation: signConfigurationOperation,
    subdigest: subdigest,
    owner: owner,
    threshold: configuration?.threshold,
  };
};
