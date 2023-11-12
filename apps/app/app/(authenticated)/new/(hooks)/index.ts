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

export {
  nameParser,
  useNameQueryState,
} from "@/app/(authenticated)/new/(hooks)/useNameQueryState";
export {
  ownerParser,
  useOwnersQueryState,
} from "@/app/(authenticated)/new/(hooks)/useOwnersQueryState";
export type {
  Owner,
  Owners,
} from "@/app/(authenticated)/new/(hooks)/useOwnersQueryState";
export {
  saltParser,
  useSaltQueryState,
} from "@/app/(authenticated)/new/(hooks)/useSaltQueryState";
export {
  thresholdParser,
  useThresholdQueryState,
} from "@/app/(authenticated)/new/(hooks)/useThresholdQueryState";
export {
  typeParser,
  useTypeQueryState,
} from "@/app/(authenticated)/new/(hooks)/useTypeQueryState";
export type { WalletType } from "@/app/(authenticated)/new/(hooks)/useTypeQueryState";
