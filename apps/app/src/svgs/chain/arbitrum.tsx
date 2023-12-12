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

export const ArbitrumLogo: React.ForwardRefExoticComponent<
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
    <rect x="1" y="1" width="22" height="22" rx="6" fill="#495775" />
    <path
      d="M12.031 13.969L13.735 16.642L15.309 15.73L13.071 12.204L12.031 13.969ZM16.743 14.658V13.928L14.298 10.12L13.391 11.659L15.751 15.476L16.604 14.981C16.6454 14.9476 16.6792 14.9058 16.7033 14.8584C16.7275 14.811 16.7413 14.7591 16.744 14.706L16.743 14.658Z"
      fill="#28A0F0"
    />
    <path
      d="M6.5 15.347L7.705 16.041L11.715 9.61101L11.035 9.59301C10.455 9.58501 9.83 9.73501 9.543 10.203L7.266 13.733L6.5 14.91V15.347ZM14.023 9.61001L12.23 9.61701L8.172 16.313L9.59 17.13L9.976 16.476L14.023 9.61101V9.61001Z"
      fill="white"
    />
    <path
      d="M17.5 9.60198C17.4919 9.41682 17.4388 9.23642 17.3454 9.07632C17.2521 8.91622 17.1212 8.78123 16.964 8.68298L12.504 6.11898C12.345 6.04094 12.1702 6.00037 11.993 6.00037C11.8158 6.00037 11.641 6.04094 11.482 6.11898C11.445 6.13798 7.146 8.63098 7.146 8.63098C6.9617 8.71995 6.80458 8.85665 6.69098 9.02688C6.57738 9.19711 6.51144 9.39465 6.5 9.59898V14.909L7.266 13.733L7.259 9.63498C7.26234 9.57869 7.27827 9.52385 7.30562 9.47453C7.33296 9.42521 7.37102 9.38265 7.417 9.34998C8.88483 8.49788 10.3535 7.64721 11.823 6.79798C11.8754 6.77233 11.9329 6.75883 11.9913 6.75848C12.0496 6.75814 12.1073 6.77096 12.16 6.79598L16.561 9.32798C16.665 9.39398 16.731 9.50698 16.736 9.62998V14.706C16.7349 14.7585 16.7227 14.8102 16.7001 14.8576C16.6775 14.905 16.6451 14.9471 16.605 14.981L15.751 15.475L15.311 15.73L13.737 16.642L12.142 17.567C12.0537 17.5983 11.9571 17.5965 11.87 17.562L9.982 16.476L9.596 17.13L11.293 18.107C11.3828 18.1573 11.4728 18.2073 11.563 18.257C11.683 18.316 11.856 18.35 12.013 18.35C12.156 18.35 12.296 18.324 12.428 18.272L17.063 15.587C17.329 15.381 17.486 15.07 17.5 14.733V9.60198Z"
      fill="#96BEDC"
    />
  </svg>
));

ArbitrumLogo.displayName = "ArbitrumLogo";
