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

enum Category {
  Transactions = "Transactions",
  Profile = "Profile",
  Settings = "Settings",
  Members = "Members",
  Support = "Support",
}

enum SettingsSubCategory {
  Account = "Account",
  Billing = "Billing",
}

type SubCategory = string;

type CategoryObject = {
  title: string;
  description: string;
  subcategories: Record<SubCategory, CategoryObject>;
};

export const TITLES: Record<Category, CategoryObject> = {
  [Category.Transactions]: {
    title: "Transactions",
    description: "View your transactions history.",
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
    },
  },
  [Category.Members]: {
    title: "Members",
    description: "Manage and view your wallet members.",
    subcategories: {},
  },
  [Category.Support]: {
    title: "Support",
    description: "Get help from our support team.",
    subcategories: {},
  },
};
