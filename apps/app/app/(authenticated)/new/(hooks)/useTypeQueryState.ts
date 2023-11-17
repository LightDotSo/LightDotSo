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

import { parseAsStringEnum, useQueryState } from "next-usequerystate";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export enum WalletType {
  "MULTI" = "multi",
  "PERSONAL" = "personal",
  "2FA" = "2fa",
}

// -----------------------------------------------------------------------------
// Parser
// -----------------------------------------------------------------------------

export const typeParser = parseAsStringEnum<WalletType>(
  Object.values(WalletType),
).withDefault(WalletType.MULTI);

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useTypeQueryState = () => {
  return useQueryState("type", typeParser);
};
