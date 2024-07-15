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

import type { ConfigurationData } from "@lightdotso/data";
import { userOperationsParser } from "@lightdotso/nuqs";
import { getConfiguration, getWallet } from "@lightdotso/services";
import { validateAddress } from "@lightdotso/validators";
import { Result } from "neverthrow";
import { notFound } from "next/navigation";
import type { Address } from "viem";
import { handler as rootPreloader } from "@/handlers/handler";

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

export const handler = async (searchParams: {
  address?: string;
  userOperations?: string;
}): Promise<{
  configuration: ConfigurationData | null;
}> => {
  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  await rootPreloader(searchParams);

  // ---------------------------------------------------------------------------
  // Validators
  // ---------------------------------------------------------------------------

  if (searchParams.address && !validateAddress(searchParams.address)) {
    return {
      configuration: null,
    };
  }

  // ---------------------------------------------------------------------------
  // Parsers
  // ---------------------------------------------------------------------------

  const userOperationsQuery = userOperationsParser.parseServerSide(
    searchParams.userOperations,
  );

  if (!userOperationsQuery) {
    return {
      configuration: null,
    };
  }

  // ---------------------------------------------------------------------------
  // Fetch Wallet and Configuration
  // ---------------------------------------------------------------------------

  const walletPromise = getWallet({ address: searchParams.address as Address });

  const configurationPromise = getConfiguration({
    address: searchParams.address as Address,
    checkpoint: 0,
  });

  const [walletRes, configurationRes] = await Promise.all([
    walletPromise,
    configurationPromise,
  ]);

  const walletAndConfigRes = Result.combineWithAllErrors([
    walletRes,
    configurationRes,
  ]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { configuration } = walletAndConfigRes.match(
    ([wallet, configuration]) => {
      return {
        wallet: wallet,
        configuration: configuration,
      };
    },
    () => {
      return notFound();
    },
  );

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  // Return an object containing an array of userOperations
  return {
    configuration: configuration,
  };
};
