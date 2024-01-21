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

export enum Action {
  NATIVE_SEND,
  NATIVE_RECEIVE,
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
