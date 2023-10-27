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

type CategoryObject = {
  title: string;
  description: string;
};

export const TITLES: Record<Category, CategoryObject> = {
  [Category.Transactions]: {
    title: "Transactions",
    description: "View your transactions history.",
  },
  [Category.Profile]: {
    title: "Profile",
    description: "View and edit your profile information.",
  },
  [Category.Settings]: {
    title: "Settings",
    description: "Manage your account settings.",
  },
  [Category.Members]: {
    title: "Members",
    description: "Manage and view your wallet members.",
  },
  [Category.Support]: {
    title: "Support",
    description: "Get help from our support team.",
  },
};
