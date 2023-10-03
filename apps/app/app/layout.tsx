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

import { headers } from "next/headers";
import { ThemeProvider, TrpcProvider, Web3Provider } from "@lightdotso/ui";
import "@lightdotso/styles/global.css";

import { siweConfig } from "./siwe";
import Script from "next/script";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-[100dvh] bg-white dark:bg-black">
        <ThemeProvider attribute="class">
          <TrpcProvider headers={headers()}>
            <Web3Provider siweConfig={siweConfig}>{children}</Web3Provider>
          </TrpcProvider>
        </ThemeProvider>
      </body>
      <Script async src="https://data.light.so/p.js" />
    </html>
  );
}
