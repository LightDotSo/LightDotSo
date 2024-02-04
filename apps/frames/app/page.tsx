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

// From: https://github.com/Zizzamia/a-frame-in-100-lines/blob/1e401d0c8ecc8d1b9ef5b31e92723eede9f06c51/app/page.tsx
// License: MIT

import { getFrameMetadata } from "@coinbase/onchainkit";
import type { Metadata } from "next";

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      label: "Show me some pending transactions!",
    },
    {
      label: "Redirect me to demo",
      action: "post_redirect",
    },
  ],
  image: `${process.env.NEXT_PUBLIC_VERCEL_URL}/park-1.png`,
  // input: {
  // text: "Tell me a boat story",
  // },
  post_url: `${process.env.NEXT_PUBLIC_VERCEL_URL}/api/frame`,
});

export const metadata: Metadata = {
  title: "framers.light.so",
  description: "Frame for light.so",
  openGraph: {
    title: "framers.light.so",
    description: "frame for light.so",
    images: [`${process.env.NEXT_PUBLIC_VERCEL_URL}/park-1.png`],
  },
  other: {
    ...frameMetadata,
  },
};

export default function Page() {
  return (
    <>
      <h1>light.so</h1>
    </>
  );
}
