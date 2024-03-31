import { defineConfig } from "vocs";

export default defineConfig({
  title: "Lightpaper",
  logoUrl: "/logo.svg",
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
      text: "Concepts",
      collapsed: false,
      items: [
        {
          text: "Comparison",
          link: "/concepts/comparison",
        },
      ],
    },
    {
      text: "Goals",
      collapsed: false,
      items: [
        {
          text: "Endgame",
          link: "/goals/endgame",
        },
      ],
    },
  ],
});
