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

export const refineNumberFormat = (number: number) => {
  if (
    number === undefined ||
    number === null ||
    isNaN(number) ||
    typeof number !== "number"
  ) {
    return "0";
  }
  if (number === 0) {
    return number.toLocaleString("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  if (number < 0.001) {
    return number.toLocaleString("en-US", {
      style: "decimal",
      minimumFractionDigits: 3,
      maximumFractionDigits: 4,
    });
  } else if (number < 0.01) {
    return number.toLocaleString("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 3,
    });
  } else {
    return number.toLocaleString("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
};
