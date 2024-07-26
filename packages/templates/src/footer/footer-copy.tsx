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

import { GITHUB_LINKS } from "@lightdotso/const";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const FooterCopy: FC = () => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <p className="text-text-weak/60 text-xs xl:text-center">
      &copy; {new Date().getFullYear()}
      <span className="hidden md:inline-flex">&nbsp;LightDotSo - </span>{" "}
      <a
        className="hidden text-text-weak hover:underline md:inline-flex"
        href={GITHUB_LINKS.Repo}
        target="_blank"
        rel="noreferrer"
      >
        Apache 2.0
      </a>{" "}
      <span className="hidden md:inline-flex">&middot;</span>{" "}
      <a
        className="hidden text-text-weak hover:underline md:inline-flex"
        href={GITHUB_LINKS.Audit}
        target="_blank"
        rel="noreferrer"
      >
        Audits
      </a>{" "}
      <span className="hidden md:inline-flex">&middot;</span>{" "}
      <a
        className="hidden text-text-weak hover:underline md:inline-flex"
        href={GITHUB_LINKS.Acknowledgements}
        target="_blank"
        rel="noreferrer"
      >
        Credits
      </a>{" "}
    </p>
  );
};
