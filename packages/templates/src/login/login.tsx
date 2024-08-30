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

import { useAuthModal } from "@lightdotso/hooks";
import { Button } from "@lightdotso/ui/components/button";
import { StateInfoSection } from "@lightdotso/ui/sections";
import { UserIcon } from "lucide-react";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const Login: FC = () => {
  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const { isAuthValid, isAuthLoading, handleAuthModal } = useAuthModal(false);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <StateInfoSection
      icon={
        <UserIcon className="mx-auto size-8 rounded-full border border-border p-2 text-text md:size-10" />
      }
      title="Login"
      description="Get started first by logging in."
    >
      <Button
        className="w-full md:w-32"
        isLoading={isAuthLoading}
        disabled={isAuthLoading}
        onClick={handleAuthModal}
      >
        {isAuthValid ? "Login" : "Connect"}
      </Button>
    </StateInfoSection>
  );
};
