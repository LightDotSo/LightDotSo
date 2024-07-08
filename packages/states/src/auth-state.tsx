// Copyright 2023-2024 LightDotSo.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

"use client";

import type { AuthSessionData, UserData } from "@lightdotso/data";
import { useQueryAuthSession, useQueryUser } from "@lightdotso/query";
import { queryKeys } from "@lightdotso/query-keys";
import { useAuth } from "@lightdotso/stores";
import { useAccount, useEnsName } from "@lightdotso/wagmi";
import { useQueryClient, QueryObserver } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import type { FC } from "react";
import type { Address } from "viem";
import { isAddress } from "viem";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const AuthState: FC = () => {
  // ---------------------------------------------------------------------------
  // Wagmi
  // ---------------------------------------------------------------------------

  const { address } = useAccount();
  const { data: ens } = useEnsName({ address: address as Address, chainId: 1 });

  // ---------------------------------------------------------------------------
  // Next Hooks
  // ---------------------------------------------------------------------------

  const pathname = usePathname();

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { setAddress, setWallet, setEns, setUserId, setSessionId } = useAuth();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const { user } = useQueryUser({
    address: address as Address,
  });

  const { authSession } = useQueryAuthSession({
    address: address as Address,
  });

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

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
    if (user) {
      setUserId(user.id);
    }
  }, [user, setUserId]);

  // Set the session in the auth state if it exists
  useEffect(() => {
    if (authSession) {
      if (authSession.is_authenticated) {
        setSessionId(authSession.id);
      } else {
        setSessionId(undefined);
      }
    } else {
      setSessionId(undefined);
    }
  }, [authSession, setSessionId]);

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
      // On logout, clear the user
      setAddress(undefined);
      setSessionId(undefined);
    }
  }, [address, setAddress, setSessionId]);

  // Subscribe to the user query
  useEffect(() => {
    const observer = new QueryObserver<UserData | null>(queryClient, {
      queryKey: queryKeys.user.get({ address: address }).queryKey,
    });

    const unsubscribe = observer.subscribe(result => {
      setUserId(result.data?.id);
    });

    return () => unsubscribe();
  }, [queryClient, address, setUserId]);

  // Subscribe to the session query
  useEffect(() => {
    const observer = new QueryObserver<AuthSessionData | null>(queryClient, {
      queryKey: queryKeys.auth.session({ address: address }).queryKey,
    });

    const unsubscribe = observer.subscribe(result => {
      if (result.data?.is_authenticated) {
        setSessionId(result.data?.id);
      }
    });

    return () => unsubscribe();
  }, [queryClient, address, setSessionId]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  // or return children if there are children to render
  return null;
};
