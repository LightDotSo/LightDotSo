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

import { defineConfig } from "vocs";

export default defineConfig({
  baseUrl:
    process.env.VERCEL_ENV === "production"
      ? "https://paper.light.so"
      : undefined,
  description: "Technical specifications for Light.",
  title: "Lightpaper",
  titleTemplate: "%s | Lightpaper",
  editLink: {
    pattern:
      "https://github.com/LightDotSo/LightDotSo/edit/main/apps/paper/pages/:path",
    text: "Suggest changes to this page.",
  },
  iconUrl: {
    light: "/light-icon-light.svg",
    dark: "/light-icon-dark.svg",
  },
  logoUrl: {
    light: "/light-logo-light.svg",
    dark: "/light-logo-dark.svg",
  },
  rootDir: ".",
  ogImageUrl: {
    "/":
      process.env.VERCEL_ENV === "production"
        ? "/og-image.png"
        : "/preview-og-image.png",
    // Thank you `wevm` team for providing the OG image service!
    "/docs":
      "https://vocs.dev/api/og?logo=%logo&title=%title&description=%description",
  },
  socials: [
    {
      icon: "github",
      link: "https://github.com/LightDotSo/LightDotSo",
    },
    {
      icon: "x",
      link: "https://x.com/LightDotSo",
    },
  ],
  sidebar: [
    {
      text: "Introduction",
      collapsed: false,
      items: [
        {
          text: "What is Light",
          link: "/introduction/why-light",
        },
        {
          text: "Chain Abstraction",
          link: "/introduction/chain-abstraction",
        },
        {
          text: "Products",
          link: "/introduction/products",
        },
      ],
    },
    {
      text: "Goals",
      link: "/goals",
    },
    {
      text: "Concepts",
      collapsed: false,
      items: [
        {
          text: "Comparison",
          link: "/concepts/comparison",
        },
      ],
    },
  ],
});
