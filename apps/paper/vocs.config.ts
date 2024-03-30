import { defineConfig } from "vocs";

export default defineConfig({
  title: "Lightpaper",
  sidebar: [
    {
      text: "Introduction",
      collapsed: false,
      items: [
        {
          text: "What is Light",
          link: "/introduction/what-is-light",
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
    {
      text: "Getting Started",
      link: "/getting-started",
    },
    {
      text: "Example",
      link: "/example",
    },
  ],
});
