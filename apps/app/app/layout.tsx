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

"use client";

import { useState } from "react";
import { Button } from "@lightdotso/ui";
import "@lightdotso/styles/global.css";
import { WagmiConfig, createConfig } from "wagmi";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { ReactQueryStreamedHydration } from "@tanstack/react-query-next-experimental";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { trpc } from "./trpc";
import { getUrl } from "@lightdotso/trpc";

// From: https://tanstack.com/query/v5/docs/react/examples/react/nextjs-suspense-streaming
// Also: https://tanstack.com/query/v4/docs/react/guides/ssr#using-the-app-directory-in-nextjs-13

const config = createConfig(
  getDefaultConfig({
    appName: "Light",
    walletConnectProjectId: "id",
  }),
);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 1000,
          },
        },
      }),
  );
  const [trpcClient] = useState(() =>
    trpc.createClient({
      transformer: superjson,
      links: [
        httpBatchLink({
          url: getUrl(),
        }),
      ],
    }),
  );

  return (
    <html lang="en">
      <body>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            <WagmiConfig config={config}>
              <ConnectKitProvider>
                <Button>Hello</Button>
                <ReactQueryStreamedHydration>
                  {children}
                </ReactQueryStreamedHydration>
              </ConnectKitProvider>
            </WagmiConfig>
          </QueryClientProvider>
        </trpc.Provider>
      </body>
    </html>
  );
}
