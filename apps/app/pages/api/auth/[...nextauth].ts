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

import type { NextApiRequest, NextApiResponse } from "next";
import NextAuth, { type NextAuthOptions } from "next-auth";
import { authOptions } from "@lightdotso/auth";

const Auth = (req: NextApiRequest, res: NextApiResponse) => {
  const authOpts: NextAuthOptions = authOptions({ req });

  const isDefaultSigninPage =
    req.method === "GET" && req?.query?.nextauth?.includes("signin");

  // Hide Sign-In with Ethereum from default sign page
  if (isDefaultSigninPage) {
    // Removes from the authOptions.providers array
    authOpts.providers.pop();
  }

  return NextAuth(req, res, authOpts) as typeof NextAuth;
};

export default Auth;
