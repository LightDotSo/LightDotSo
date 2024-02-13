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

import type { CategoryObject } from "@lightdotso/types";

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

export enum Category {
  Root = "Root",
  Demo = "Demo",
  New = "New",
  Notifications = "Notifications",
  Wallets = "Wallets",
  Overview = "Overview",
  UserOperation = "UserOperation",
  Transactions = "Transactions",
  Profile = "Profile",
  Settings = "Settings",
  WalletSettings = "WalletSettings",
  Activity = "Activity",
  Dev = "Dev",
  Owners = "Owners",
  Send = "Send",
  Support = "Support",
}

// -----------------------------------------------------------------------------
// Sub
// -----------------------------------------------------------------------------

export enum DemoSubCategory {
  Overview = Category.Overview,
  UserOperation = Category.UserOperation,
  Transactions = Category.Transactions,
  Activity = Category.Activity,
  Owners = Category.Owners,
  Send = Category.Send,
}

export enum UserOperationSubCategory {
  Details = "Details",
}

export enum OverviewSubCategory {
  All = "All",
  Tokens = "Tokens",
  NFTs = "NFTs",
  History = "History",
}

export enum TransactionsSubCategory {
  All = "All",
  Queue = "Queue",
  History = "History",
}

export enum SettingsSubCategory {
  Appearance = "Appearance",
  Notifications = "Notifications",
  Profile = "Profile",
}

export enum WalletSettingsSubCategory {
  Account = "Account",
  Billing = "Billing",
  Deployment = "Deployment",
  Notifications = "Notifications",
  WalletSettings = "Wallet Settings",
}

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
  [Category.Notifications]: {
    title: "Notifications",
    description: "View your notifications.",
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
    subcategories: {
      [TransactionsSubCategory.All]: {
        title: "All",
        description: "View all your wallet transactions.",
        subcategories: {},
      },
      [TransactionsSubCategory.Queue]: {
        title: "Queue",
        description: "View your queued transactions.",
        subcategories: {},
      },
      [TransactionsSubCategory.History]: {
        title: "History",
        description: "View your transaction history.",
        subcategories: {},
      },
    },
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
      [SettingsSubCategory.Appearance]: {
        title: "Appearance",
        description: "Manage your appearance settings.",
        subcategories: {},
      },
      [SettingsSubCategory.Notifications]: {
        title: "Notifications",
        description: "Manage your notification settings.",
        subcategories: {},
      },
      [SettingsSubCategory.Profile]: {
        title: "Profile",
        description: "Manage your profile settings.",
        subcategories: {},
      },
    },
  },
  [Category.WalletSettings]: {
    title: "Wallet Settings",
    description: "Manage your wallet settings.",
    subcategories: {
      [WalletSettingsSubCategory.WalletSettings]: {
        title: "Wallet Settings",
        description: "Manage your wallet settings",
        subcategories: {
          ["Name"]: {
            title: "Name",
            description: "Manage your wallet name",
            note: "This is the name that will be displayed to others.",
            subcategories: {},
          },
          ["Dev"]: {
            title: "Dev",
            description: "Enable or disable dev mode",
            note: "This will enable or disable dev mode for your wallet.",
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
      [WalletSettingsSubCategory.Account]: {
        title: "Account",
        description: "Manage your wallet account",
        subcategories: {},
      },
      [WalletSettingsSubCategory.Billing]: {
        title: "Billing",
        description: "Manage your billing information",
        subcategories: {
          ["Balance"]: {
            title: "Balance",
            description: "Manage your wallet balance",
            note: "View and manage your wallet balance.",
            subcategories: {},
          },
        },
      },
      [WalletSettingsSubCategory.Deployment]: {
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
      [WalletSettingsSubCategory.Notifications]: {
        title: "Notifications",
        description: "Manage your wallet notifications.",
        subcategories: {
          ["Notification Settings"]: {
            title: "Notification Settings",
            description: "Manage your wallet notification settings.",
            note: "Manage your wallet notification settings.",
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
  [Category.Dev]: {
    title: "Developer Mode",
    description: "Conduct and execute transactions as a developer.",
    subcategories: {},
  },
  [Category.Support]: {
    title: "Support",
    description: "Get help from our support team.",
    subcategories: {},
  },
  [Category.Demo]: {
    title: "Demo",
    description: "Demo",
    subcategories: {
      [DemoSubCategory.Overview]: {
        title: "Demo Overview",
        description: "[Demo] View your wallet overview.",
        subcategories: {
          [OverviewSubCategory.All]: {
            title: "Demo Overview All",
            description: "View all your wallet assets.",
            subcategories: {},
          },
          [OverviewSubCategory.Tokens]: {
            title: "Demo Tokens",
            description: "[Demo] View your wallet tokens.",
            subcategories: {},
          },
          [OverviewSubCategory.NFTs]: {
            title: "Demo NFTs",
            description: "[Demo] View your wallet NFTs.",
            subcategories: {},
          },
          [OverviewSubCategory.History]: {
            title: "Demo History",
            description: "[Demo] View your wallet history.",
            subcategories: {},
          },
        },
      },
      [DemoSubCategory.Transactions]: {
        title: "Demo Transactions",
        description: "[Demo] Conduct and execute transactions.",
        subcategories: {
          [TransactionsSubCategory.All]: {
            title: "Demo All",
            description: "[Demo] View all your wallet transactions.",
            subcategories: {},
          },
          [TransactionsSubCategory.Queue]: {
            title: "Demo Queue",
            description: "[Demo] View your queued transactions.",
            subcategories: {},
          },
          [TransactionsSubCategory.History]: {
            title: "Demo History",
            description: "[Demo] View your transaction history.",
            subcategories: {},
          },
        },
      },
      [DemoSubCategory.UserOperation]: {
        title: "Demo User Operation",
        description: "[Demo] Perform and execute transactions.",
        subcategories: {},
      },
      [DemoSubCategory.Activity]: {
        title: "Demo Activity",
        description: "[Demo] View your wallet activity.",
        subcategories: {},
      },
      [DemoSubCategory.Send]: {
        title: "Demo Send",
        description: "[Demo] Send assets to another wallet.",
        subcategories: {},
      },
      [DemoSubCategory.Owners]: {
        title: "Demo Owners",
        description: "[Demo] Manage and view your wallet owners.",
        subcategories: {},
      },
    },
  },
};
