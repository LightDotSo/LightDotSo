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

import { useId } from "react";

export function Logo(props: React.ComponentPropsWithoutRef<"svg">) {
  let id = useId();

  return (
    <svg viewBox="0 0 140 32" fill="none" aria-hidden="true" {...props}>
      <title>Commit</title>
      <mask id={`${id}-m`} fill="#fff">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M31.75 18h-8.13a8 8 0 01-15.5 0H0a16 16 0 0031.75 0zm0-4h-8.13a8 8 0 00-15.5 0H0a16 16 0 0131.75 0z"
        />
      </mask>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M31.75 18h-8.13a8 8 0 01-15.5 0H0a16 16 0 0031.75 0zm0-4h-8.13a8 8 0 00-15.5 0H0a16 16 0 0131.75 0z"
        fill={`url(#${id}-g)`}
      />
      <path
        d="M31.75 18l1 .12.13-1.12h-1.13v1zm-8.13 0v-1h-.77l-.2.75.97.25zm-15.5 0l.98-.25-.2-.75h-.77v1zM0 18v-1h-1.13l.14 1.12L0 18zm23.62-4l-.96.25.19.75h.77v-1zm8.13 0v1h1.13l-.14-1.12-.99.12zM8.13 14v1h.77l.2-.75-.97-.25zM0 14l-1-.12-.13 1.12H0v-1zm31.75 3h-8.13v2h8.13v-2zm-9.1.75A7 7 0 0115.89 23v2a9 9 0 008.71-6.75l-1.93-.5zM15.89 23a7 7 0 01-6.78-5.25l-1.94.5A9 9 0 0015.88 25v-2zm-7.75-6H0v2h8.13v-2zm7.75 14A15 15 0 01.99 17.88l-1.98.24A17 17 0 0015.88 33v-2zm14.88-13.12A15 15 0 0115.88 31v2a17 17 0 0016.86-14.88l-1.98-.24zM23.62 15h8.13v-2h-8.13v2zm-7.74-6a7 7 0 016.78 5.25l1.93-.5A9 9 0 0015.88 7v2zM9.1 14.25A7 7 0 0115.88 9V7a9 9 0 00-8.72 6.75l1.94.5zM0 15h8.13v-2H0v2zm1-.88A15 15 0 0115.87 1v-2A17 17 0 00-1 13.88l1.98.24zM15.87 1a15 15 0 0114.88 13.12l1.98-.24A17 17 0 0015.88-1v2z"
        fill="#fff"
        fillOpacity={0.2}
        mask={`url(#${id}-m)`}
      />
      <path
        d="M52.42 24.24c4.5 0 7.83-2.54 8.26-6.36h-4.37c-.33 1.63-1.94 2.69-3.89 2.69-2.7 0-4.46-1.66-4.46-5.33 0-3.65 1.75-5.3 4.46-5.3 2.02 0 3.5 1.1 3.9 2.66h4.36c-.43-3.8-3.7-6.34-8.26-6.34-5.32 0-8.88 3.24-8.88 8.98 0 5.76 3.56 9 8.88 9zm16.35 0c4.18 0 6.56-2.71 6.56-6.72 0-4.25-2.62-6.72-6.56-6.72-4.17 0-6.57 2.71-6.57 6.72 0 4.25 2.64 6.72 6.57 6.72zm0-3.29c-1.5 0-2.47-1.05-2.47-3.43 0-2.4.99-3.46 2.47-3.46 1.5 0 2.48 1.06 2.48 3.46s-.99 3.43-2.48 3.43zm8.6 3.05h4.06v-7.27c0-1.35.8-2.64 2.33-2.64 1.42 0 2 .96 2 2.93V24h4.07v-7.27c0-1.35.8-2.64 2.3-2.64 1.42 0 2.02.96 2.02 2.93V24h4.06v-7.87c0-3.87-1.94-5.33-4.4-5.33-1.91 0-3.57.94-4.14 2.8h-.2c-.7-2.06-2.3-2.8-4.05-2.8-1.68 0-3.2.84-3.8 2.47h-.19l-.12-2.23h-3.93V24zm23.5 0h4.05v-7.27c0-1.35.8-2.64 2.33-2.64 1.41 0 1.99.96 1.99 2.93V24h4.08v-7.27c0-1.35.8-2.64 2.3-2.64 1.42 0 2.02.96 2.02 2.93V24h4.05v-7.87c0-3.87-1.94-5.33-4.39-5.33-1.92 0-3.57.94-4.15 2.8h-.2c-.69-2.06-2.3-2.8-4.05-2.8-1.68 0-3.19.84-3.79 2.47h-.2l-.11-2.23h-3.94V24zm23.48-14.47h4.05V6.5h-4.05v3.03zm0 14.47h4.05V11.04h-4.05V24zm11.45 0h2.95v-3.26h-1.51c-.63 0-.99-.17-.99-.9V14.3h2.5v-3.26h-2.5v-3.8l-4.05.37v3.43h-2.23v3.26h2.23v6.3c0 2.06.72 3.4 3.6 3.4z"
        fill="#fff"
      />
      <defs>
        <linearGradient
          id={`${id}-g`}
          x1={15.88}
          y1={0}
          x2={15.88}
          y2={32}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#AAE4FF" />
          <stop offset={1} stopColor="#38BDF8" />
        </linearGradient>
      </defs>
    </svg>
  );
}
