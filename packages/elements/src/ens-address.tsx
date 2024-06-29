// Copyright 2023-2024 Light.
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

import { shortenAddress } from "@lightdotso/utils";
import { useEnsAddress } from "@lightdotso/wagmi";
import type { FC } from "react";
import { normalize } from "viem/ens";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export type EnsAddressProps = {
  name: string;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const EnsAddress: FC<EnsAddressProps> = ({ name }) => {
  // ---------------------------------------------------------------------------
  // Wagmi
  // ---------------------------------------------------------------------------

  const { data: ensAddress } = useEnsAddress({
    name: normalize(name),
    chainId: 1,
  });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{ensAddress && shortenAddress(ensAddress)}</>;
};
