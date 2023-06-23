"use client";

import { TamaguiProvider } from "@lightdotso/ui";

export default function RootLayout({ children }: { children: any }) {
  return (
    <html lang="en">
      <body>
        <TamaguiProvider>{children}</TamaguiProvider>
      </body>
    </html>
  );
}
