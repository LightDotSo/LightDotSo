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

import { AppBanner } from "@/components/app-banner";
import { Nav } from "@/components/nav/nav";
import { Root as LightRoot } from "@lightdotso/roots/root";
import { Footer } from "@lightdotso/templates/footer";
import { Web3Provider } from "@lightdotso/ui/providers/web3";
import { wagmiConfig } from "@lightdotso/wagmi/config";
import { cookieToInitialState } from "@lightdotso/wagmi/wagmi";
import { headers } from "next/headers";
import type { FC, ReactNode } from "react";
import { RootWrapper } from "./root-wrapper";

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
  const initialState = cookieToInitialState(
    wagmiConfig,
    headers().get("cookie"),
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <LightRoot>
      <Web3Provider initialState={initialState}>
        {/* Banner */}
        <AppBanner />
        {/* Layout */}
        <Nav>{children}</Nav>
        <Footer />
        {/* UI */}
        <RootWrapper />
      </Web3Provider>
    </LightRoot>
  );
};
