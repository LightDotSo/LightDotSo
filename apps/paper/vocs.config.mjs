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
import pkg from "../../package.json";

export default defineConfig({
  // baseUrl:
  //   process.env.VERCEL_ENV === "production"
  //     ? "https://paper.light.so"
  //     : undefined,
  description: "Technical specifications for Light.",
  title: "Lightpaper",
  titleTemplate: "%s | Lightpaper",
  // head() {
  //   return (
  //     // eslint-disable-nextline react/jsx-no-useless-fragment
  //     <>
  //       <link
  //         rel="icon"
  //         href="https://light.so/favicon.ico"
  //         type="image/x-icon"
  //         sizes="255x256"
  //       />
  //     </>
  //   );
  // },
  editLink: {
    pattern:
      "https://github.com/LightDotSo/LightDotSo/edit/main/apps/paper/pages/:path",
    text: "Suggest changes to this page.",
  },
  // iconUrl: {
  //   light: "https://paper.light.so/light-icon-light.svg",
  //   dark: "https://paper.light.so/light-icon-dark.svg",
  // },
  logoUrl: {
    light: "/light-logo-light.svg",
    dark: "/light-logo-dark.svg",
  },
  rootDir: ".",
  ogImageUrl: {
    "/":
      process.env.VERCEL_ENV === "production"
        ? "https://paper.light.so/og-image.png"
        : "https://paper.light.so/preview-og-image.png",
    // Thank you `wevm` team for providing the OG image service!
    "/docs":
      "https://vocs.dev/api/og?logo=%logo&title=%title&description=%description",
  },
  socials: [
    {
      icon: "discord",
      link: "https://discord.gg/LightDotSo",
    },
    {
      icon: "github",
      link: "https://github.com/LightDotSo/LightDotSo",
    },
    // {
    //   icon: "warpcast",
    //   link: "https://warpcast.com/~/channel/lightdotso",
    // },
    {
      icon: "telegram",
      link: "https://t.me/LightDotSo",
    },
    {
      icon: "x",
      link: "https://x.com/LightDotSo",
    },
  ],
  sidebar: [
    {
      text: "Introduction",
      items: [
        {
          text: "Why Light",
          link: "/introduction",
        },
        {
          text: "Chain Abstraction",
          link: "/introduction/chain-abstraction",
        },
        {
          text: "Products",
          link: "/introduction/products",
        },
        {
          text: "User Flow",
          link: "/introduction/user-flow",
        },
        {
          text: "Comparison",
          link: "/introduction/comparison",
        },
        {
          text: "Philosophy",
          link: "/introduction/philosophy",
        },
      ],
    },
    {
      text: "Goals",
      items: [
        {
          text: "Goals for Light",
          link: "/goals",
        },
        {
          text: "Target Metrics",
          link: "/goals/metrics",
        },
        {
          text: "The Future",
          link: "/goals/future",
        },
      ],
    },
    {
      text: "Products",
      items: [
        {
          text: "Light Smart Wallet",
          link: "/light-smart-wallet",
          items: [
            {
              text: "What it Enables",
              link: "/light-smart-wallet",
            },
            {
              text: "Key Features",
              link: "/light-smart-wallet/key-features",
            },
            {
              text: "Ecosystem Support",
              link: "/light-smart-wallet/ecosystem",
            },
          ],
        },
        {
          text: "Light Gas Abstraction",
          link: "/light-gas-abstraction",
          items: [
            {
              text: "How it Works",
              link: "/light-gas-abstraction",
            },
            {
              text: "Contract Functions",
              link: "/light-gas-abstraction/contract-functions",
            },
            {
              text: "RPC Calls",
              link: "/light-gas-abstraction/rpc-calls",
            },
          ],
        },
        {
          text: "Light Programmable Intents",
          link: "/light-programmable-intents",
          items: [
            {
              text: "Underlying Architecture",
              link: "/light-programmable-intents",
            },
            {
              text: "Actors in the System",
              link: "/light-programmable-intents/actors",
            },
            {
              text: "Programmable Intents",
              link: "/light-programmable-intents/intents",
            },
          ],
        },
      ],
    },
    {
      text: "Features",
      link: "/features",
      collapsed: false,
      items: [
        {
          text: "Cross-chain Smart Account",
          link: "/features/cross-chain-smart-account",
        },
        {
          text: "Gas Abstraction",
          link: "/features/gas-abstraction",
        },
        {
          text: "Programmable Execution",
          link: "/features/programmable-execution",
        },
        {
          text: "Keystore Sync",
          link: "/features/keystore-sync",
        },
        {
          text: "Signature Aggregation",
          link: "/features/signature-aggregation",
        },
        {
          text: "Transaction Batching",
          link: "/features/transaction-batching",
        },
        {
          text: "Intent Engine",
          link: "/features/intent-engine",
        },
        {
          text: "Light Layer",
          link: "/features/light-layer",
        },
      ],
    },
    {
      text: "Resources",
      collapsed: false,
      items: [
        {
          text: "Actors",
          link: "/resources/actors",
        },
        {
          text: "Contracts",
          link: "/resources/contracts",
        },
        {
          text: "Fees",
          link: "/resources/fees",
        },
      ],
    },
    {
      text: "Glossary",
      collapsed: true,
      items: [
        {
          text: "FAQ",
          link: "/glossary/faq",
        },
        {
          text: "Known Limitations",
          link: "/glossary/limitations",
          collapsed: false,
          items: [
            {
              text: "4337",
              link: "/glossary/limitations/4337",
            },
            {
              text: "EVM",
              link: "/glossary/limitations/evm",
            },
            {
              text: "MPC",
              link: "/glossary/limitations/mpc",
            },
          ],
        },
        {
          text: "Terms",
          link: "/glossary/terms",
        },
      ],
    },
    {
      text: "References",
      collapsed: true,
      items: [
        {
          text: "Acknowledgements",
          link: "/references/acknowledgements",
        },
        {
          text: "Sources",
          link: "/references/sources",
        },
        {
          text: "Thinking",
          link: "/references/thinking",
        },
      ],
    },
    {
      text: "Use Cases",
      link: "/use-cases/list",
      collapsed: true,
      items: [
        {
          text: "List of Use Cases",
          link: "/use-cases/list",
        },
        {
          text: "Batch Send",
          link: "/use-cases/batch-send",
        },
        {
          text: "USDC Example",
          link: "/use-cases/usdc-selection",
        },
      ],
    },
  ],
  topNav: [
    {
      text: "Home",
      link: "https://light.so/home",
    },
    {
      text: "Demo",
      link: "https://light.so/demo",
    },
    {
      text: pkg.version,
      items: [
        {
          text: pkg.version,
          link: `https://github.com/LightDotSo/LightDotSo/commit/${process.env.VERCEL_GIT_COMMIT_SHA}`,
        },
        {
          text: "Changelog",
          link: "https://github.com/LightDotSo/LightDotSo/blob/main/CHANGELOG.md",
        },
        // {
        //   text: "Contributing",
        //   link: "https://github.com/LightDotSo/LightDotSo/blob/main/CONTRIBUTING.md",
        // },
      ],
    },
  ],
});
