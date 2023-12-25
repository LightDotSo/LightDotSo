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

import { err, ok, ResultAsync } from "neverthrow";

// From: https://github.com/radixdlt/babylon-alphanet/blob/5c73dab8e04163250c7e4dcc17fc85d37b89b778/alphanet-walletextension-sdk/sandbox/core-api/utils.ts#L1C1-L17C79
// License: Apache-2.0
export const fromResponse = <T>(response: Response) =>
  ResultAsync.fromPromise(response.text(), error => error as Error)
    .andThen(text => {
      try {
        return ok(JSON.parse(text));
      } catch (error) {
        return err({
          code: response.status,
          url: response.url,
          message: `Could not fetch data from API (status ${response.status})`,
          error,
        });
      }
    })
    .map((data: T) => ({ data, status: response.status, url: response.url }));

// From: https://github.com/radixdlt/babylon-alphanet/blob/5c73dab8e04163250c7e4dcc17fc85d37b89b778/alphanet-walletextension-sdk/sandbox/core-api/core-api.ts#L80C9-L80C16
// License: Apache-2.0
export const fetchWithResult = <T>(
  data: any,
  ...input: Parameters<typeof fetch>
) =>
  ResultAsync.fromPromise(
    fetch(input[0], {
      ...input[1],
      method: "POST",
      headers: {
        ...(input[1]?.headers || {}),
        "content-type": "application/json",
      },
      body: JSON.stringify(data),
    }),
    error => error as Error,
  )
    .andThen(response => fromResponse<T>(response))
    .andThen(({ data, status }) =>
      status === 200
        ? ok<T, never>(data)
        : err<never, unknown>(data as unknown),
    );
