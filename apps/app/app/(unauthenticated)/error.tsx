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

import { useEffect } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface ErrorProps {
  error: Error & { digest?: string };
  resetAction: () => void;
}

// -----------------------------------------------------------------------------
// Error
// -----------------------------------------------------------------------------

// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
export default function Error({ error, resetAction }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    // biome-ignore lint/suspicious/noConsole: <explanation>
    console.error(error);
  }, [error]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div>
      <h2>Something went wrong!</h2>
      {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
      <button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => resetAction()
        }
      >
        Try again
      </button>
    </div>
  );
}
