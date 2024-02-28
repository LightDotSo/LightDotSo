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

import type { ConfigurationOperationCreateBodyParams } from "@lightdotso/params";
import {
  useQueryConfiguration,
  useMutationConfigurationOperationCreate,
} from "@lightdotso/query";
// import { hashSetImageHash, subdigestOf } from "@lightdotso/sequence";
import { useAuth } from "@lightdotso/stores";
import { useSignMessage } from "@lightdotso/wagmi";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Address, Hex } from "viem";
import {
  isAddressEqual,
  toBytes,
  // hexToBytes,
  // // fromHex,
  // decodeFunctionData,
} from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type ConfigurationOperationCreateProps = {
  address: Address;
  params?: ConfigurationOperationCreateBodyParams;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const useConfigurationOperationCreate = ({
  address,
  params,
}: ConfigurationOperationCreateProps) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { address: userAddress } = useAuth();
  // const { setPageIndex } = useModalSwiper();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { configuration } = useQueryConfiguration({
    address,
  });

  const { configurationOperationCreate } =
    useMutationConfigurationOperationCreate({
      address,
      simulate: false,
    });

  // ---------------------------------------------------------------------------
  // State Hooks
  // ---------------------------------------------------------------------------

  const [isConfigurationOperationLoading, setIsConfigurationOperationLoading] =
    useState(false);
  const [signedData, setSignedData] = useState<Hex>();

  // ---------------------------------------------------------------------------
  // Local Variables
  // ---------------------------------------------------------------------------

  const subdigest = useMemo(() => {
    // return subdigestOf(
    //   address,
    //   hashSetImageHash(
    //     calculateImageHash()
    //   )
    // );
    return "0x";
  }, [address]);

  // ---------------------------------------------------------------------------
  // Wagmi
  // ---------------------------------------------------------------------------

  const { data, signMessage, isPending: isSignLoading } = useSignMessage();

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

  // Sync the loading state
  useEffect(() => {
    setIsConfigurationOperationLoading(isSignLoading);
  }, [isSignLoading]);

  // Sync the signed data
  useEffect(() => {
    if (!data) {
      return;
    }

    setSignedData(data);
  }, [data]);

  useEffect(() => {
    const createUserOp = async () => {
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

    createUserOp();
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
    isConfigurationOperationCreatable,
    isConfigurationOperationLoading,
    // isValidConfigurationOperation,
    // decodedCallData,
    // decodedInitCode,
    // // paymasterHash,
    // // paymasterNonce,
    signConfigurationOperation,
    // subdigest,
    owner,
    threshold: configuration?.threshold,
  };
};
