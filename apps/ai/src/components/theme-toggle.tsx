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

// Copyright 2023-2024 Vercel, Inc.
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

import { IconMoon, IconSun } from "@/components/icons";
import { ButtonIcon } from "@lightdotso/ui/components/button-icon";
import { useTheme } from "next-themes";
import { useTransition } from "react";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [_, startTransition] = useTransition();

  return (
    <ButtonIcon
      variant="ghost"
      onClick={() => {
        startTransition(() => {
          setTheme(theme === "light" ? "dark" : "light");
        });
      }}
    >
      {theme ? (
        theme === "dark" ? (
          <IconMoon className="transition-all" />
        ) : (
          <IconSun className="transition-all" />
        )
      ) : null}
      <span className="sr-only">Toggle theme</span>
    </ButtonIcon>
  );
}
