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
  image: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/api/image?text="Show me some pending transactions!"`,
  post_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/api/frame`,
});

export const metadata: Metadata = {
  title: "framers.light.so",
  description: "Frame for light.so",
  openGraph: {
    title: "framers.light.so",
    description: "frame for light.so",
    images: [
      `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/api/image?text="You have some pending transactions"`,
    ],
  },
  other: {
    ...frameMetadata,
  },
};

export default function Page() {
  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      <h1>light.so</h1>
    </>
  );
}
