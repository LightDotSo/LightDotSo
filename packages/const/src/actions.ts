// Copyright 2023-2024 Light.
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
  UNKNOWN,
  NATIVE_RECEIVE,
  NATIVE_SEND,
  ERC20_APPROVE,
  ERC20_RECEIVE,
  ERC20_SEND,
  ERC20_MINT,
  ERC20_BURN,
  ERC721_APPROVE,
  ERC721_RECEIVE,
  ERC721_SEND,
  ERC721_MINT,
  ERC721_BURN,
  ERC1155_APPROVE,
  ERC1155_RECEIVE,
  ERC1155_SEND,
  ERC1155_MINT,
  ERC1155_BURN,
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
