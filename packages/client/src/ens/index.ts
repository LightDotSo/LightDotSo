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

import { ResultAsync } from "neverthrow";
import { z } from "zod";
import { ensClient } from "../client";
import { zodGraphqlRequest } from "../zod";

export const ENS_DOMAINS_QUERY = /* GraphQL */ `
  query lookup($name: String!, $amount: Int!) {
    domains(
      first: $amount
      where: { name_contains: $name, resolvedAddress_not: null }
    ) {
      name
      resolver {
        addr {
          id
        }
      }
    }
  }
`;

export const ensDomainsSchema = z.object({
  domains: z.array(
    z.object({
      name: z.string(),
      resolver: z.object({
        addr: z.object({
          id: z.string(),
        }),
      }),
    }),
  ),
});

export const getEnsDomains = async (params: {
  name: string;
  amount: number;
}) => {
  const client = ensClient();
  return ResultAsync.fromPromise(
    zodGraphqlRequest(client, ENS_DOMAINS_QUERY, params, ensDomainsSchema),
    e => e,
  );
};
