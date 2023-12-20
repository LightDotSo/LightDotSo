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

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

export enum Category {
  Root = "Root",
  New = "New",
  Wallets = "Wallets",
  Overview = "Overview",
  UserOperation = "UserOperation",
  Transactions = "Transactions",
  Profile = "Profile",
  Settings = "Settings",
  Activity = "Activity",
  Owners = "Owners",
  Send = "Send",
  Support = "Support",
}

// -----------------------------------------------------------------------------
// Sub
// -----------------------------------------------------------------------------

export enum UserOperationSubCategory {
  Details = "Details",
}

export enum OverviewSubCategory {
  All = "All",
  Tokens = "Tokens",
  NFTs = "NFTs",
  History = "History",
}

export enum SettingsSubCategory {
  Account = "Account",
  Billing = "Billing",
  Deployment = "Deployment",
  WalletSettings = "Wallet Settings",
}

export type SubCategory = string;

export type CategoryObject = {
  title: string;
  description: string;
  note?: string;
  subcategories: Record<SubCategory, CategoryObject>;
};

// -----------------------------------------------------------------------------
// All
// -----------------------------------------------------------------------------

export const TITLES: Record<Category, CategoryObject> = {
  [Category.Root]: {
    title: "Welcome",
    description: "Welcome to Light.",
    subcategories: {},
  },
  [Category.New]: {
    title: "New Wallet",
    description: "Create a new wallet.",
    subcategories: {},
  },
  [Category.Wallets]: {
    title: "Wallet List",
    description: "View your wallet list.",
    subcategories: {},
  },
  [Category.UserOperation]: {
    title: "Transaction",
    description: "Perform and execute transactions.",
    subcategories: {
      [UserOperationSubCategory.Details]: {
        title: "Details",
        description: "View transaction details.",
        subcategories: {},
      },
    },
  },
  [Category.Overview]: {
    title: "Overview",
    description: "View your wallet overview.",
    subcategories: {
      [OverviewSubCategory.All]: {
        title: "All",
        description: "View all your wallet assets.",
        subcategories: {},
      },
      [OverviewSubCategory.Tokens]: {
        title: "Tokens",
        description: "View your wallet tokens.",
        subcategories: {},
      },
      [OverviewSubCategory.NFTs]: {
        title: "NFTs",
        description: "View your wallet NFTs.",
        subcategories: {},
      },
      [OverviewSubCategory.History]: {
        title: "History",
        description: "View your wallet history.",
        subcategories: {},
      },
    },
  },
  [Category.Transactions]: {
    title: "Transactions",
    description: "Conduct and execute transactions.",
    subcategories: {},
  },
  [Category.Profile]: {
    title: "Profile",
    description: "View and edit your profile information.",
    subcategories: {},
  },
  [Category.Settings]: {
    title: "Settings",
    description: "Manage your account settings.",
    subcategories: {
      [SettingsSubCategory.WalletSettings]: {
        title: "Wallet Settings",
        description: "Manage your wallet settings",
        subcategories: {
          ["Name"]: {
            title: "Name",
            description: "Manage your wallet name",
            note: "This is the name that will be displayed to others.",
            subcategories: {},
          },
          ["Testnet"]: {
            title: "Testnet",
            description: "Enable or disable testnet",
            note: "This will enable or disable testnet for your wallet.",
            subcategories: {},
          },
        },
      },
      [SettingsSubCategory.Account]: {
        title: "Account",
        description: "Manage your wallet account",
        subcategories: {},
      },
      [SettingsSubCategory.Billing]: {
        title: "Billing",
        description: "Manage your billing information",
        subcategories: {},
      },
      [SettingsSubCategory.Deployment]: {
        title: "Deployment",
        description: "Manage your wallet deployments.",
        subcategories: {
          ["Chain"]: {
            title: "Chain",
            description: "Manage your chain deployment",
            note: "Deploy to a new chain or update your existing chain.",
            subcategories: {},
          },
        },
      },
    },
  },
  [Category.Activity]: {
    title: "Activity",
    description: "View your wallet activity.",
    subcategories: {},
  },
  [Category.Owners]: {
    title: "Owners",
    description: "Manage and view your wallet owners.",
    subcategories: {},
  },
  [Category.Send]: {
    title: "Send",
    description: "Send assets to another wallet.",
    subcategories: {},
  },
  [Category.Support]: {
    title: "Support",
    description: "Get help from our support team.",
    subcategories: {},
  },
};
