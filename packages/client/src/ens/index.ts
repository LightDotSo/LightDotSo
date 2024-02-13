import { ResultAsync } from "neverthrow";
import { zodGraphqlRequest } from "../zod";
import { z } from "zod";

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

export const getEnsDomains = async (
  endpoint: string,
  params: { name: string; amount: number },
) => {
  return ResultAsync.fromPromise(
    zodGraphqlRequest(endpoint, ENS_DOMAINS_QUERY, params, ensDomainsSchema),
    e => e,
  );
};
