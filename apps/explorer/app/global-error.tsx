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
import type { BrowserClient } from "@sentry/react";
import { getCurrentHub } from "@sentry/react";
import { Feedback } from "@sentry-internal/feedback";
import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { useEffect } from "react";
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

  useEffect(() => {
    const client = getCurrentHub().getClient<BrowserClient>();
    const feedback = client?.getIntegration(Feedback);
    if (feedback) {
      feedback.openDialog();
    }
  }, []);

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
