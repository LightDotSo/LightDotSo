import { OverviewSubCategory } from "@/const/titles";

// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

export const OVERVIEW_NAV_ITEMS = [
  {
    title: "All",
    href: "/overview",
    id: "overview",
    category: OverviewSubCategory.All,
  },
  {
    title: "Tokens",
    href: "/overview/tokens",
    id: "tokens",
    category: OverviewSubCategory.Tokens,
  },
  {
    title: "NFT",
    href: "/overview/nfts",
    id: "nfts",
    category: OverviewSubCategory.NFTs,
  },
  {
    title: "Transactions",
    href: "/overview/transactions",
    id: "transactions",
    category: OverviewSubCategory.Transactions,
  },
];
