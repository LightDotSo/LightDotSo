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

import { type Result, ResultAsync } from "neverthrow";

// Inspired by: https://github.com/isomerpages/isomercms-backend/blob/2fbf00b8c945fae96d15fceb8905f2db7bcdff70/src/utils/neverthrow.ts

export const convertNeverThrowToPromise = async <T, E>(
  x:
    | Promise<Result<T, E> | ResultAsync<T, E>>
    | Result<T, E>
    | ResultAsync<T, E>,
): Promise<T> => {
  const result = await Promise.resolve(x);

  if (result instanceof ResultAsync) {
    return result.match(
      (value) => value,
      (error) => {
        throw error;
      },
    );
  }

  return result.match(
    (value) => value,
    (error) => {
      throw error;
    },
  );
};
