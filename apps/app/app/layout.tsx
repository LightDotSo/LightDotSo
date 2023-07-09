import { Button } from "@lightdotso/ui";
import "@lightdotso/styles/global.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Button />
        {children}
      </body>
    </html>
  );
}
