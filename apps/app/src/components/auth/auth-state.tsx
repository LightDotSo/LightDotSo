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

"use client";

import { getUser } from "@lightdotso/client";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import type { FC } from "react";
import { isAddress } from "viem";
import type { Address } from "viem";
import { useAccount, useEnsName } from "wagmi";
import type { UserData } from "@/data";
import { queries } from "@/queries";
import { useAuth } from "@/stores/useAuth";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const AuthState: FC = () => {
  const { address } = useAccount();
  const { data: ens } = useEnsName({ address, chainId: 1 });
  const { setAddress, setWallet, setEns, logout, setUserId } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const currentData: UserData | undefined = useQueryClient().getQueryData(
    queries.user.get(address as Address).queryKey,
  );

  const { data } = useSuspenseQuery<UserData | null>({
    queryKey: queries.user.get(address as Address).queryKey,
    queryFn: async () => {
      if (!address) {
        return null;
      }

      const res = await getUser({
        params: {
          query: {
            address,
          },
        },
      });

      // Return if the response is 200
      return res.match(
        data => {
          return data;
        },
        _ => {
          return currentData ?? null;
        },
      );
    },
  });

  // On component mount, rehydrate the auth state from local storage
  // https://docs.pmnd.rs/zustand/integrations/persisting-store-data#getoptions
  useEffect(() => {
    useAuth.persist.rehydrate();
  }, []);

  // Set the ens name in the auth state if it exists
  useEffect(() => {
    if (ens) {
      setEns(ens);
    }
  }, [ens, setEns]);

  // Set the userId in the auth state if it exists
  useEffect(() => {
    if (data) {
      setUserId(data.id);
    }
  }, [data, setUserId]);

  // Check if the first segment of the pathname is a valid address w/ isAddress
  // If it is, set the auth state's wallet to that address
  useEffect(() => {
    const segments = pathname.split("/");
    if (segments.length > 1) {
      const maybeAddress = segments[1];
      if (isAddress(maybeAddress)) {
        setWallet(maybeAddress);
      }
    }
  }, [pathname, address, setWallet]);

  // On component mount, or when the address from useAccount changes,
  // update the auth state's address
  useEffect(() => {
    if (address) {
      setAddress(address);
    } else {
      logout();
      router.push("/");
    }
  }, [address, logout, router, setAddress]);

  useEffect(() => {
    // If on the home page and selected paths, and the user is logged in, redirect to `/wallets`
    // This is to prevent the user from seeing the home page when they are logged in
    if (
      address &&
      (pathname === "/" ||
        pathname === "/transactions" ||
        pathname === "/owners")
    ) {
      router.push("/wallets");
    }
  }, [address, pathname, router]);

  return null; // or return children if there are children to render
};
