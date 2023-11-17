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

// From: https://tanstack.com/query/latest/docs/react/guides/suspense
// Handles errors globally

"use client";

import { Button } from "@lightdotso/ui";
import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const { reset: resetQuery } = useQueryErrorResetBoundary();

  return (
    <html lang="en">
      <body>
        <h2>Something went wrong!</h2>
        <ErrorBoundary
          onReset={resetQuery}
          fallbackRender={({ resetErrorBoundary }) => (
            <div>
              There was an error!
              <Button
                onClick={() => {
                  reset();
                  resetErrorBoundary();
                }}
              >
                Try again
              </Button>
            </div>
          )}
        ></ErrorBoundary>
        <pre>
          <code>{error.message}</code>
        </pre>
      </body>
    </html>
  );
}
