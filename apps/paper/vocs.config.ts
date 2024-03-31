import { defineConfig } from "vocs";

export default defineConfig({
  title: "Lightpaper",
  // logoUrl: "/logo-dark.svg",
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
