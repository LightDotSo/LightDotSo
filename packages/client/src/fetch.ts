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

// Copyright 2017-present Babylon Alphanet
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { ResultAsync, err, ok } from "neverthrow";

// From: https://github.com/radixdlt/babylon-alphanet/blob/5c73dab8e04163250c7e4dcc17fc85d37b89b778/alphanet-walletextension-sdk/sandbox/core-api/utils.ts#L1C1-L17C79
// License: Apache-2.0
export const fromResponse = <T>(response: Response) =>
  ResultAsync.fromPromise(response.text(), (error) => error as Error)
    .andThen((text) => {
      try {
        return ok(JSON.parse(text));
      } catch (error) {
        return err({
          code: response.status,
          url: response.url,
          message: `Could not fetch data from API (status ${response.status})`,
          error: error,
        });
      }
    })
    .map((data: T) => ({
      data: data,
      status: response.status,
      url: response.url,
    }));

// From: https://github.com/radixdlt/babylon-alphanet/blob/5c73dab8e04163250c7e4dcc17fc85d37b89b778/alphanet-walletextension-sdk/sandbox/core-api/core-api.ts#L80C9-L80C16
// License: Apache-2.0
export const fetchWithResult = <T>(
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
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
    (error) => error as Error,
  )
    .andThen((response) => fromResponse<T>(response))
    .andThen(({ data, status }) =>
      status === 200
        ? ok<T, never>(data)
        : err<never, unknown>(data as unknown),
    );
