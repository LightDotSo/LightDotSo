// Copyright 2023-2024 Light
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

import { LightorizontalLogo } from "@lightdotso/svg";
import { Footer } from "@lightdotso/templates";
import { useTheme } from "next-themes";
import { useConfig } from "nextra-theme-docs";
import type { DocsThemeConfig } from "nextra-theme-docs";

const config: DocsThemeConfig = {
  chat: {
    link: "https://discord.gg/LightotSo",
  },
  docsRepositoryBase:
    "https://github.com/LightotSo/LightotSo/blob/main/apps/docs",
  editLink: {
    text: "Edit this page on GitHub",
  },
  faviconGlyph: "✦",
  project: {
    link: "https://github.com/LightotSo/LightotSo",
  },
  sidebar: {
    autoCollapse: true,
    defaultMenuCollapseLevel: 1,
    toggleButton: true,
  },
  footer: { component: <Footer /> },
  logo: <LightorizontalLogo />,
  logoLink: "/",
  useNextSeoProps: function () {
    const { frontMatter } = useConfig();
    return {
      title: frontMatter.title || "Light,
      description:
        frontMatter.description || "Light EVM Chain Abstraction Protocol",
      openGraph: {
        images: [{ url: frontMatter.image || "https://docs.light.so/og.png" }],
      },
      titleTemplate: "%s - Light,
      twitter: {
        cardType: "summary_large_image",
        site: "https://docs.light.so",
      },
    };
  },
};

export default config;
