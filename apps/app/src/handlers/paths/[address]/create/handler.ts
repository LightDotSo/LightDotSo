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

import { CONTRACT_ADDRESSES } from "@lightdotso/const";
import type { ConfigurationData } from "@lightdotso/data";
import { userOperationsParser } from "@lightdotso/nuqs";
import type { UserOperation } from "@lightdotso/schemas";
import {
  getConfiguration,
  getUserOperationNonce,
  getUserOperations,
  getWallet,
} from "@lightdotso/services";
import { calculateInitCode } from "@lightdotso/solutions";
import { Result } from "neverthrow";
import { notFound } from "next/navigation";
import type { Address, Hex } from "viem";
import { handler as addressHandler } from "@/handlers/paths/[address]/handler";
import { validateAddress } from "@/handlers/validators/address";

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

export const handler = async (
  params: { address: string },
  searchParams: {
    userOperations?: string;
  },
): Promise<{
  configuration: ConfigurationData;
  userOperations: Omit<
    UserOperation,
    | "hash"
    | "signature"
    | "maxFeePerGas"
    | "maxPriorityFeePerGas"
    | "callGasLimit"
    | "verificationGasLimit"
    | "preVerificationGas"
  >[];
}> => {
  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  await addressHandler(params);

  // ---------------------------------------------------------------------------
  // Validators
  // ---------------------------------------------------------------------------

  validateAddress(params.address);

  // ---------------------------------------------------------------------------
  // Parsers
  // ---------------------------------------------------------------------------

  const userOperationsQuery = userOperationsParser.parseServerSide(
    searchParams.userOperations,
  );

  if (!userOperationsQuery) {
    notFound();
  }

  // ---------------------------------------------------------------------------
  // Fetch Nonce
  // ---------------------------------------------------------------------------

  const noncePromises = userOperationsQuery.map(operation => {
    return getUserOperationNonce({
      address: params.address as Address,
      chain_id: Number(operation.chainId) as number,
    });
  });

  // Resolve all promises
  const nonces = await Promise.all(noncePromises);

  // If there are any errors among responses
  if (nonces.some(n => n.isErr())) {
    notFound();
  }

  // ---------------------------------------------------------------------------
  // Fetch Wallet and Configuration
  // ---------------------------------------------------------------------------

  const walletPromise = getWallet({ address: params.address as Address });

  const configurationPromise = getConfiguration({
    address: params.address as Address,
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
  const { wallet, configuration } = walletAndConfigRes.match(
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
  // Defaults
  // ---------------------------------------------------------------------------

  let ops: Omit<
    UserOperation,
    | "hash"
    | "signature"
    | "maxFeePerGas"
    | "maxPriorityFeePerGas"
    | "callGasLimit"
    | "verificationGasLimit"
    | "preVerificationGas"
  >[] =
    userOperationsQuery &&
    userOperationsQuery.map(operation => {
      const nonce =
        nonces[userOperationsQuery.indexOf(operation)]._unsafeUnwrap().nonce;
      return {
        chainId: operation.chainId as bigint,
        sender: params.address as Address,
        paymasterAndData: "0x",
        nonce: BigInt(nonce),
        initCode: (operation.initCode as Hex) ?? "0x",
        callData: (operation.callData as Hex) ?? "0x",
      };
    });

  // ---------------------------------------------------------------------------
  // Fetch
  // ---------------------------------------------------------------------------

  const resPromises = ops.map(op => {
    return getUserOperations({
      address: params.address as Address,
      status: "executed",
      offset: 0,
      limit: 1,
      order: "asc",
      is_testnet: true,
      chain_id: Number(op.chainId) as number,
    });
  });

  // Resolve all promises
  const res = await Promise.all(resPromises);

  // If there are any errors among responses, return the lightly parsed userOperations
  if (res.some(r => r.isErr())) {
    return {
      configuration: configuration,
      userOperations: ops,
    };
  }

  // Add the initCode to the response if there are no operations
  const parsedUserOperations = ops.map((op, index) => {
    // Parse
    const parsedRes = res[index]._unsafeUnwrap();

    // If there are no operations, add the initCode to the response
    if (parsedRes.length === 0) {
      return {
        ...op,
        initCode: calculateInitCode(
          CONTRACT_ADDRESSES["Factory"] as Address,
          configuration.image_hash as Hex,
          wallet.salt as Hex,
        ),
      };
    } else {
      return {
        ...op,
      };
    }
  });

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  // Return an object containing an array of userOperations
  return {
    configuration: configuration,
    userOperations: parsedUserOperations,
  };
};
