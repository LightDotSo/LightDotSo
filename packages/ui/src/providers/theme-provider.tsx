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

"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type ThemeProviderProps = Parameters<typeof NextThemesProvider>[0];

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

/// From: https://github.com/pacocoursey/next-themes/blob/cd67bfa20ef6ea78a814d65625c530baae4075ef/examples/with-app-dir/src/components/ThemeProvider.tsx
function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

export { ThemeProvider };
