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

import { getAuthSession, getUser, postAuthLogout } from "@lightdotso/client";
import {
  useSuspenseQuery,
  useQueryClient,
  QueryObserver,
} from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import type { FC } from "react";
import { isAddress } from "viem";
import type { Address } from "viem";
import { useAccount, useEnsName } from "wagmi";
import type { AuthSessionData, UserData } from "@/data";
import { queries } from "@/queries";
import { useAuth } from "@/stores";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const AuthState: FC = () => {
  // ---------------------------------------------------------------------------
  // Wagmi Hooks
  // ---------------------------------------------------------------------------

  const { address } = useAccount();
  const { data: ens } = useEnsName({ address, chainId: 1 });

  // ---------------------------------------------------------------------------
  // Next Hooks
  // ---------------------------------------------------------------------------

  const pathname = usePathname();
  const router = useRouter();

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { setAddress, setWallet, setEns, setUserId, setSessionId } = useAuth();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const currentData: UserData | undefined = queryClient.getQueryData(
    queries.user.get({ address: address as Address }).queryKey,
  );

  const { data } = useSuspenseQuery<UserData | null>({
    queryKey: queries.user.get({ address: address as Address }).queryKey,
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

  const { data: sessionData } = useSuspenseQuery<AuthSessionData | null>({
    queryKey: queries.auth.session({ address: address as Address }).queryKey,
    queryFn: async () => {
      if (!address) {
        return null;
      }

      const res = await getAuthSession({
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
          return null;
        },
      );
    },
    staleTime: 300,
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

  // Set the session in the auth state if it exists
  useEffect(() => {
    if (sessionData) {
      setSessionId(sessionData.id);
    } else {
      setSessionId(undefined);
    }
  }, [sessionData, setSessionId]);

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
    const logout = async () => {
      if (address) {
        setAddress(address);
      } else {
        // On logout, clear the user
        setAddress(undefined);
        setSessionId(undefined);
        await postAuthLogout();
      }
    };

    logout();
  }, [address, setAddress, setSessionId]);

  // Subscribe to the user query
  useEffect(() => {
    const observer = new QueryObserver<UserData | null>(queryClient, {
      queryKey: queries.user.get({ address: address as Address }).queryKey,
    });

    const unsubscribe = observer.subscribe(result => {
      setUserId(result.data?.id);
    });

    return () => unsubscribe();
  }, [queryClient, address, setUserId]);

  // Subscribe to the session query
  useEffect(() => {
    const observer = new QueryObserver<AuthSessionData | null>(queryClient, {
      queryKey: queries.auth.session({ address: address as Address }).queryKey,
    });

    const unsubscribe = observer.subscribe(result => {
      setSessionId(result.data?.id);
    });

    return () => unsubscribe();
  }, [queryClient, address, setSessionId]);

  useEffect(() => {
    // If on the home page and selected paths, and the user is logged in, redirect to `/wallets`
    // This is to prevent the user from seeing the home page when they are logged in
    if (
      address &&
      (pathname === "/" ||
        pathname.startsWith("/overview") ||
        pathname === "/transactions" ||
        pathname === "/owners")
    ) {
      router.push("/wallets");
    }
  }, [address, pathname, router]);

  return null; // or return children if there are children to render
};
