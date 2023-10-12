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

import { getWallet } from "@lightdotso/client";
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

  let res = await getWallet({ address: params.address, isPublic: false });

  // -------------------------------------------------------------------------
  // Parse
  // -------------------------------------------------------------------------

  res.map(response => {
    if (response && response.response && response.response.status !== 200) {
      return notFound();
    }
  });

  return res._unsafeUnwrap();
};
