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

import { ExternalLink } from "@/components/external-link";
import { cn } from "@lightdotso/utils";
import type { ComponentProps } from "react";

export function FooterText({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "px-2 text-center text-muted-foreground text-xs leading-normal",
        className,
      )}
      {...props}
    >
      Open source AI chatbot built with{" "}
      <ExternalLink href="https://nextjs.org">Next.js</ExternalLink> and{" "}
      <ExternalLink href="https://github.com/vercel/ai">
        Vercel AI SDK
      </ExternalLink>
      .
    </p>
  );
}
