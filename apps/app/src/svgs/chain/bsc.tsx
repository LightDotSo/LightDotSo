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

import { forwardRef } from "react";

export const BscLogo: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.SVGProps<SVGSVGElement>> &
    React.RefAttributes<SVGSVGElement>
> = forwardRef((props, ref) => (
  <svg
    {...props}
    ref={ref}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="1" y="1" width="22" height="22" rx="6" fill="#F3BA2F" />
    <path
      d="M13.3218 16.6264V18.1954L11.954 19L10.6264 18.1954V16.6264L11.954 17.431L13.3218 16.6264ZM6 11.1954L7.32759 12V14.6954L9.62069 16.0632V17.6322L6 15.5V11.1954ZM17.908 11.1954V15.5L14.2471 17.6322V16.0632L16.5402 14.6954V12L17.908 11.1954ZM14.2471 9.06322L15.6149 9.86782V11.4368L13.3218 12.8046V15.5402L11.9943 16.3448L10.6667 15.5402V12.8046L8.2931 11.4368V9.86782L9.66092 9.06322L11.954 10.431L14.2471 9.06322ZM8.2931 12.5632L9.62069 13.3678V14.9368L8.2931 14.1322V12.5632ZM15.6149 12.5632V14.1322L14.2874 14.9368V13.3678L15.6149 12.5632ZM7.32759 7.6954L8.6954 8.5L7.32759 9.3046V10.8736L6 10.069V8.5L7.32759 7.6954ZM16.5805 7.6954L17.9483 8.5V10.069L16.5805 10.8736V9.3046L15.2529 8.5L16.5805 7.6954ZM11.954 7.6954L13.3218 8.5L11.954 9.3046L10.6264 8.5L11.954 7.6954ZM11.954 5L15.6149 7.13218L14.2874 7.93678L11.9943 6.56897L9.66092 7.93678L8.33333 7.13218L11.954 5Z"
      fill="white"
    />
  </svg>
));

BscLogo.displayName = "BscLogo";
