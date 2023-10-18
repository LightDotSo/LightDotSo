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

import { getConfiguration, getWallet } from "@lightdotso/client";
import { notFound } from "next/navigation";
import { validateAddress } from "./validators/address";

export const handler = async (params: { address: string }) => {
  // -------------------------------------------------------------------------
  // Validators
  // -------------------------------------------------------------------------

  validateAddress(params.address);

  // -------------------------------------------------------------------------
  // Fetch
  // -------------------------------------------------------------------------

  let wallet = await getWallet(
    {
      params: {
        query: {
          address: params.address,
        },
      },
    },
    false,
  );

  let config = await getConfiguration(
    { params: { query: { address: params.address } } },
    false,
  );

  // -------------------------------------------------------------------------
  // Parse
  // -------------------------------------------------------------------------

  wallet.map(response => {
    if (
      response &&
      response.response &&
      response.response.status !== 200 &&
      !response.data &&
      response.data !== undefined
    ) {
      return notFound();
    }
  });

  config.map(response => {
    if (
      response &&
      response.response &&
      response.response.status !== 200 &&
      !response.data &&
      response.data !== undefined
    ) {
      return notFound();
    }
  });

  return {
    wallet: wallet._unsafeUnwrap().data!,
    config: config._unsafeUnwrap().data!,
  };
};
