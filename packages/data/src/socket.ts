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

// -----------------------------------------------------------------------------
// Data
// -----------------------------------------------------------------------------

export type SocketBalanceData = {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  price?: number;
  amount: number;
  currency?: string;
};

export type SocketBalancePageData = {
  success: boolean;
  result: SocketBalanceData[];
};

export type SocketTokenPriceData = {
  chainId: number;
  tokenAddress: string;
  price: number;
  currency: string;
};

export type SocketTokenPricePageData = {
  success: boolean;
  result: SocketTokenPriceData;
};
