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

import CredentialsProvider from "next-auth/providers/credentials";
import { getCsrfToken } from "next-auth/react";
import { SiweMessage } from "siwe";
import { prisma } from "@lightdotso/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { getServerSession } from "next-auth";
import type { AuthOptions } from "next-auth";
import { getAddress } from "viem";

export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
  },
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET!,
  callbacks: {
    async session({ session, token }: { session: any; token: any }) {
      session.token = token;
      session.token.expires = session.expires;
      session.id = token.sub;
      session.user.address = session.user.name;
      session.user.image = "/";
      return session;
    },
  },
  providers: [
    CredentialsProvider({
      id: "eth",
      name: "Ethereum",
      credentials: {
        message: {
          label: "Message",
          type: "text",
          placeholder: "0x0",
        },
        signature: {
          label: "Signature",
          type: "text",
          placeholder: "0x0",
        },
      },
      async authorize(credentials, req) {
        // console.log(JSON.stringify(credentials, null, 2));
        try {
          const siwe = new SiweMessage(
            JSON.parse(credentials?.message || "{}"),
          );
          const nextAuthUrl = new URL(process.env.NEXTAUTH_URL!);

          const result = await siwe.verify({
            signature: credentials?.signature!,
            domain: nextAuthUrl.host,
            nonce: await getCsrfToken({ req: { headers: req?.headers } }),
          });

          if (!result.success) {
            throw new Error("Invalid Signature");
          }

          if (
            result.data.statement !== process.env.NEXT_PUBLIC_SIGNIN_MESSAGE
          ) {
            throw new Error("Statement Mismatch");
          }

          // Get the address in checksum format
          const address = getAddress(result.data.address);

          // Check if the account already exists
          const existingAccount = await prisma.account.findFirst({
            where: {
              providerAccountId: address,
            },
            select: {
              userId: true,
              providerAccountId: true,
              user: {
                select: {
                  image: true,
                  name: true,
                },
              },
            },
          });

          if (existingAccount) {
            return {
              id: existingAccount.userId,
              name: existingAccount.user.name,
              image: existingAccount.user.image,
            };
          }

          // Create new user and account sequentially
          const { user } = await prisma.$transaction(async tx => {
            const user = await tx.user.create({
              data: {
                name: address,
              },
            });
            const account = await tx.account.create({
              data: {
                userId: user.id,
                providerType: "credentials",
                providerId: "eth",
                providerAccountId: address,
              },
            });
            return {
              user,
              account,
            };
          });

          return {
            id: user.id,
            name: user.name,
          };
        } catch (err) {
          console.error(err);
          return null;
        }
      },
    }),
  ],
};

export const getAuthSession = async () => {
  return await getServerSession(authOptions);
};
