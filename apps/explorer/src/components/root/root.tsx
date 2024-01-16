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

import {
  TailwindIndicator,
  ThemeProvider,
  ReactQueryProvider,
  Toaster,
  Footer,
  VercelToolbar,
} from "@lightdotso/ui";
import { Inter } from "next/font/google";
import Script from "next/script";
import { Suspense } from "react";
import type { FC, ReactNode } from "react";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface RootProps {
  children: ReactNode;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const Root: FC<RootProps> = ({ children }) => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <html
      suppressHydrationWarning
      lang="en"
      className={`${inter.variable} font-sans`}
    >
      <body className="min-h-[100dvh] bg-background-body">
        <ThemeProvider attribute="class">
          <ReactQueryProvider>
            {children}
            <Footer />
            {/* Utility Functions */}
            <Toaster />
          </ReactQueryProvider>
        </ThemeProvider>
        <TailwindIndicator />
        <Suspense>
          <VercelToolbar />
        </Suspense>
      </body>
      <Script async src="https://data.light.so/p.js" />
    </html>
  );
};
