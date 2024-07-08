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

export const shortenAddress = (address: string) => {
  return (
    address?.substring(0, 6) +
    `...` +
    address?.substring(address.length - 4, address.length)
  );
};

export const shortenBytes32 = (bytes32: string) => {
  return (
    bytes32?.substring(0, 6) +
    `...` +
    bytes32?.substring(bytes32.length - 8, bytes32.length)
  );
};

export const shortenName = (name: string) => {
  return name.match(/\b\w/g)?.join("").substring(0, 3);
};
