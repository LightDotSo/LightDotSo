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

import { CONTRACT_ADDRESSES, ContractAddress } from "@lightdotso/const";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

export const isEntryPointV06LightWalletFactory = (
  factoryAddress: Address | undefined,
) => {
  if (!factoryAddress) {
    return false;
  }

  return (
    factoryAddress ===
      CONTRACT_ADDRESSES[ContractAddress.LIGHT_WALLET_FACTORY_V010_ADDRESS] ||
    factoryAddress ===
      CONTRACT_ADDRESSES[ContractAddress.LIGHT_WALLET_FACTORY_V020_ADDRESS]
  );
};

export const isEntryPointV07LightWalletFactory = (
  factoryAddress: Address | undefined,
) => {
  if (!factoryAddress) {
    return false;
  }

  return (
    factoryAddress ===
    CONTRACT_ADDRESSES[ContractAddress.LIGHT_WALLET_FACTORY_V030_ADDRESS]
  );
};

export const isEntryPointV06LightWalletFactoryImplementation = (
  implementationAddress: Address | undefined,
) => {
  if (!implementationAddress) {
    return false;
  }

  return (
    implementationAddress ===
      CONTRACT_ADDRESSES[
        ContractAddress.LIGHT_WALLET_FACTORY_V010_IMPLEMENTATION
      ] ||
    implementationAddress ===
      CONTRACT_ADDRESSES[
        ContractAddress.LIGHT_WALLET_FACTORY_V020_IMPLEMENTATION
      ]
  );
};

export const isEntryPointV07LightWalletFactoryImplementation = (
  implementationAddress: Address | undefined,
) => {
  if (!implementationAddress) {
    return false;
  }

  return (
    implementationAddress ===
    CONTRACT_ADDRESSES[ContractAddress.LIGHT_WALLET_FACTORY_V030_IMPLEMENTATION]
  );
};
