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

import { Action } from "@lightdotso/const";
import type { badgeVariants } from "@lightdotso/ui/components/badge";
import { BadgeIcon } from "@lightdotso/ui/components/badge-icon";
import type { VariantProps } from "class-variance-authority";
import {
  ArrowDown,
  ArrowUp,
  Flame,
  HelpCircle,
  PlusCircle,
  UnlockIcon,
} from "lucide-react";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

export const ActionLogoIntents: Record<
  Action,
  Extract<VariantProps<typeof badgeVariants>["intent"], string>
> = {
  [Action.UNKNOWN]: "default",
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

// biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
export const ActionLogos: Record<Action, React.ElementType> = {
  [Action.UNKNOWN]: HelpCircle,
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
