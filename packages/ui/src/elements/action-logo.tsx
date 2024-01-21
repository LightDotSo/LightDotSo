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

import { Action } from "@lightdotso/const";
import type { VariantProps } from "class-variance-authority";
import {
  ArrowDown,
  ArrowUp,
  Flame,
  PlusCircle,
  UnlockIcon,
} from "lucide-react";
import type { FC } from "react";
import type { badgeVariants } from "../components/badge";
import { BadgeIcon } from "../components/badge-icon";

// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

export const ActionLogoIntents: Record<
  Action,
  Extract<VariantProps<typeof badgeVariants>["intent"], string>
> = {
  [Action.NATIVE_RECEIVE]: "pink",
  [Action.NATIVE_SEND]: "info",
  [Action.ERC20_APPROVE]: "purple",
  [Action.ERC20_RECEIVE]: "pink",
  [Action.ERC20_SEND]: "info",
  [Action.ERC20_MINT]: "success",
  [Action.ERC20_BURN]: "destructive",
  [Action.ERC721_APPROVE]: "purple",
  [Action.ERC721_RECEIVE]: "pink",
  [Action.ERC721_SEND]: "info",
  [Action.ERC721_MINT]: "success",
  [Action.ERC721_BURN]: "destructive",
  [Action.ERC1155_APPROVE]: "purple",
  [Action.ERC1155_RECEIVE]: "pink",
  [Action.ERC1155_SEND]: "info",
  [Action.ERC1155_MINT]: "success",
  [Action.ERC1155_BURN]: "destructive",
};

export const ActionLogos: Record<Action, React.ElementType> = {
  [Action.NATIVE_RECEIVE]: ArrowDown,
  [Action.NATIVE_SEND]: ArrowUp,
  [Action.ERC20_APPROVE]: UnlockIcon,
  [Action.ERC20_RECEIVE]: ArrowDown,
  [Action.ERC20_MINT]: PlusCircle,
  [Action.ERC20_SEND]: ArrowUp,
  [Action.ERC20_BURN]: Flame,
  [Action.ERC721_APPROVE]: UnlockIcon,
  [Action.ERC721_RECEIVE]: ArrowDown,
  [Action.ERC721_SEND]: ArrowUp,
  [Action.ERC721_MINT]: PlusCircle,
  [Action.ERC721_BURN]: Flame,
  [Action.ERC1155_APPROVE]: UnlockIcon,
  [Action.ERC1155_RECEIVE]: ArrowDown,
  [Action.ERC1155_SEND]: ArrowUp,
  [Action.ERC1155_MINT]: PlusCircle,
  [Action.ERC1155_BURN]: Flame,
};

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export interface ActionLogoProps {
  action: Action;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const ActionLogo: FC<ActionLogoProps> = ({ action }) => {
  const intent = ActionLogoIntents[action];
  const Logo = ActionLogos[action];
  return (
    <BadgeIcon intent={intent} variant="shadow" size="sm">
      <Logo className="size-4" />
    </BadgeIcon>
  );
};
