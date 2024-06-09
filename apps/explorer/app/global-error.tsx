// Copyright 2023-2024 Light, Inc.
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
// Error
// -----------------------------------------------------------------------------

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const { reset: resetQuery } = useQueryErrorResetBoundary();

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <html lang="en">
      <body>
        <h2>Something went wrong!</h2>
        <ErrorBoundary
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
          onReset={resetQuery}
        />
        <pre>
          <code>{error.message}</code>
        </pre>
      </body>
    </html>
  );
}
