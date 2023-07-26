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

import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type Account = {
  id: string;
  userId: string;
  providerType: string;
  providerId: string;
  providerAccountId: string;
  refreshToken: string | null;
  accessToken: string | null;
  accessTokenExpires: Timestamp | null;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
};
export type Session = {
  id: string;
  userId: string;
  expires: Timestamp;
  sessionToken: string;
  accessToken: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
};
export type User = {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Timestamp | null;
  image: string | null;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
};
export type VerificationRequest = {
  id: string;
  identifier: string;
  token: string;
  expires: Timestamp;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
};
export type DB = {
  Account: Account;
  Session: Session;
  User: User;
  VerificationRequest: VerificationRequest;
};
