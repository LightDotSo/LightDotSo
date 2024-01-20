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
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { SVGProps, RefAttributes, JSX, FC } from "react";
import { BadgeIcon } from "../components/badge-icon";

// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

export const ActionLogos: Record<Action, React.ElementType> = {
  [Action.ERC20_APPROVE]: (
    props: JSX.IntrinsicAttributes &
      SVGProps<SVGSVGElement> &
      RefAttributes<SVGSVGElement>,
  ) => <ArrowUpRight className="w-6 h-6 text-gray-600" {...props} />,
  [Action.ERC20_RECEIVE]: (
    props: JSX.IntrinsicAttributes &
      SVGProps<SVGSVGElement> &
      RefAttributes<SVGSVGElement>,
  ) => <ArrowDownLeft className="w-6 h-6 text-gray-600" {...props} />,
  [Action.ERC20_TRANSFER]: (
    props: JSX.IntrinsicAttributes &
      SVGProps<SVGSVGElement> &
      RefAttributes<SVGSVGElement>,
  ) => <ArrowUpRight className="w-6 h-6 text-gray-600" {...props} />,
  [Action.ERC721_APPROVE]: (
    props: JSX.IntrinsicAttributes &
      SVGProps<SVGSVGElement> &
      RefAttributes<SVGSVGElement>,
  ) => <ArrowUpRight className="w-6 h-6 text-gray-600" {...props} />,
  [Action.ERC721_RECEIVE]: (
    props: JSX.IntrinsicAttributes &
      SVGProps<SVGSVGElement> &
      RefAttributes<SVGSVGElement>,
  ) => <ArrowDownLeft className="w-6 h-6 text-gray-600" {...props} />,
  [Action.ERC721_TRANSFER]: (
    props: JSX.IntrinsicAttributes &
      SVGProps<SVGSVGElement> &
      RefAttributes<SVGSVGElement>,
  ) => <ArrowUpRight className="w-6 h-6 text-gray-600" {...props} />,
  [Action.ERC1155_APPROVE]: (
    props: JSX.IntrinsicAttributes &
      SVGProps<SVGSVGElement> &
      RefAttributes<SVGSVGElement>,
  ) => <ArrowUpRight className="w-6 h-6 text-gray-600" {...props} />,
  [Action.ERC1155_RECEIVE]: (
    props: JSX.IntrinsicAttributes &
      SVGProps<SVGSVGElement> &
      RefAttributes<SVGSVGElement>,
  ) => <ArrowDownLeft className="w-6 h-6 text-gray-600" {...props} />,
  [Action.ERC1155_TRANSFER]: (
    props: JSX.IntrinsicAttributes &
      SVGProps<SVGSVGElement> &
      RefAttributes<SVGSVGElement>,
  ) => <ArrowUpRight className="w-6 h-6 text-gray-600" {...props} />,
  [Action.ERC1155_BATCH_APPROVE]: (
    props: JSX.IntrinsicAttributes &
      SVGProps<SVGSVGElement> &
      RefAttributes<SVGSVGElement>,
  ) => <ArrowUpRight className="w-6 h-6 text-gray-600" {...props} />,
  [Action.ERC1155_BATCH_RECEIVE]: (
    props: JSX.IntrinsicAttributes &
      SVGProps<SVGSVGElement> &
      RefAttributes<SVGSVGElement>,
  ) => <ArrowDownLeft className="w-6 h-6 text-gray-600" {...props} />,
  [Action.ERC1155_BATCH_TRANSFER]: (
    props: JSX.IntrinsicAttributes &
      SVGProps<SVGSVGElement> &
      RefAttributes<SVGSVGElement>,
  ) => <ArrowUpRight className="w-6 h-6 text-gray-600" {...props} />,
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
  const Logo = ActionLogos[action];
  return (
    <BadgeIcon variant="shadow">
      <Logo />
    </BadgeIcon>
  );
};
