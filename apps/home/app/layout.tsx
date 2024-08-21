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

import "@lightdotso/styles/global.css";
import { Footer, Root } from "@lightdotso/templates";
import { ThemeProvider, Web3Provider } from "@lightdotso/ui";
import { cookieToInitialState, wagmiConfig } from "@lightdotso/wagmi";
import { headers } from "next/headers";
import type { ReactNode } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface RootLayoutProps {
  children: ReactNode;
}

// -----------------------------------------------------------------------------
// Layout
// -----------------------------------------------------------------------------

export default function RootLayout({ children }: RootLayoutProps) {
  const initialState = cookieToInitialState(
    wagmiConfig,
    headers().get("cookie"),
  );

  return (
    <Root>
      <Web3Provider initialState={initialState}>
        {children}
        <ThemeProvider attribute="class" forcedTheme="dark">
          <Footer />
        </ThemeProvider>
      </Web3Provider>
    </Root>
  );
}
