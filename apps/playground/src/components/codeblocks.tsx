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

import { cn } from "@lightdotso/utils";
import { highlight as lighterHighlight } from "@code-hike/lighter";
import type { Theme } from "@code-hike/lighter";
import { cache, Fragment } from "react";

const highlight = cache(lighterHighlight);

export interface CodeBlockProps {
  code: string;
  lang: string;
  theme?: Theme;
  className?: string;
}

export async function CodeBlock({
  code,
  lang,
  theme = "github-light",
  className,
}: CodeBlockProps) {
  const { lines } = await highlight(code, lang, theme);

  return (
    <pre
      className={cn(
        "bg-background-stronger relative overflow-x-auto rounded p-4 px-[0.33rem] py-[0.33rem] font-mono text-sm font-semibold",
        lang,
        className,
      )}
    >
      <code>
        {lines.map((tokenLine, i) => (
          <Fragment key={i}>
            <span>
              {tokenLine.map((token, j) => {
                return (
                  <span key={j} style={token.style}>
                    {token.content}
                  </span>
                );
              })}
            </span>
            {i < lines.length - 1 && "\n"}
          </Fragment>
        ))}
      </code>
    </pre>
  );
}

export function tokenizeCode(code: string, lang: string, theme: Theme) {
  return <CodeBlock code={code} lang={lang} theme={theme} />;
}
