// Copyright 2023-2024 Light
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
