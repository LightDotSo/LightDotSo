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

import * as dotenv from "dotenv";
dotenv.config();

// Default Anvil addresses, & balances
// From: https://github.com/wagmi-dev/viem/blob/41bafa3d8db3d9dd58c0179d15c9e7d00b00871c/src/_test/constants.ts
// Thank you to the wagmi team for the awesome work on viem!
export const accounts = [
  {
    address: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
    balance: 10000000000000000000000n,
    privateKey:
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  },
  {
    address: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
    balance: 10000000000000000000000n,
  },
  {
    address: "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc",
    balance: 10000000000000000000000n,
  },
  {
    address: "0x90f79bf6eb2c4f870365e785982e1f101e93b906",
    balance: 10000000000000000000000n,
  },
  {
    address: "0x15d34aaf54267db7d7c367839aaf71a00a2c6a65",
    balance: 10000000000000000000000n,
  },
  {
    address: "0x9965507d1a55bcc2695c58ba16fb37d819b0a4dc",
    balance: 10000000000000000000000n,
  },
  {
    address: "0x976ea74026e726554db657fa54763abd0c3a0aa9",
    balance: 10000000000000000000000n,
  },
  {
    address: "0x14dc79964da2c08b23698b3d3cc7ca32193d9955",
    balance: 10000000000000000000000n,
  },
  {
    address: "0x23618e81e3f5cdf7f54c3d65f7fbc0abf5b21e8f",
    balance: 10000000000000000000000n,
  },
  {
    address: "0xa0ee7a142d267c1f36714e4a8f75612f20a79720",
    balance: 10000000000000000000000n,
  },
] as const;
