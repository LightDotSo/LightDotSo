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

export enum Action {
  UNKNOWN = 0,
  NATIVE_RECEIVE = 1,
  NATIVE_SEND = 2,
  ERC20_APPROVE = 3,
  ERC20_RECEIVE = 4,
  ERC20_SEND = 5,
  ERC20_MINT = 6,
  ERC20_BURN = 7,
  ERC721_APPROVE = 8,
  ERC721_RECEIVE = 9,
  ERC721_SEND = 10,
  ERC721_MINT = 11,
  ERC721_BURN = 12,
  ERC1155_APPROVE = 13,
  ERC1155_RECEIVE = 14,
  ERC1155_SEND = 15,
  ERC1155_MINT = 16,
  ERC1155_BURN = 17,
}

export const ACTION_LABELS: Record<Action, string> = {
  [Action.UNKNOWN]: "Unknown",
  [Action.NATIVE_RECEIVE]: "Receive",
  [Action.NATIVE_SEND]: "Send",
  [Action.ERC20_APPROVE]: "Approve",
  [Action.ERC20_RECEIVE]: "Receive",
  [Action.ERC20_MINT]: "Mint",
  [Action.ERC20_SEND]: "Send",
  [Action.ERC20_BURN]: "Burn",
  [Action.ERC721_APPROVE]: "Approve",
  [Action.ERC721_RECEIVE]: "Receive",
  [Action.ERC721_SEND]: "Send",
  [Action.ERC721_MINT]: "Mint",
  [Action.ERC721_BURN]: "Burn",
  [Action.ERC1155_APPROVE]: "Approve",
  [Action.ERC1155_RECEIVE]: "Receive",
  [Action.ERC1155_SEND]: "Send",
  [Action.ERC1155_MINT]: "Mint",
  [Action.ERC1155_BURN]: "Burn",
};
