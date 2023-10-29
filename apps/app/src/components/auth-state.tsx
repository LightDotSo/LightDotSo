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

import { useEffect } from "react";
import { useAuth } from "@/stores/useAuth";
import { useAccount } from "wagmi";
import { usePathname } from "next/navigation";
import { isAddress } from "viem";

export const AuthState = () => {
  const { address } = useAccount();
  const { setAddress, setWallet, logout } = useAuth();
  const pathname = usePathname();

  // On component mount, rehydrate the auth state from local storage
  // https://docs.pmnd.rs/zustand/integrations/persisting-store-data#getoptions
  useEffect(() => {
    useAuth.persist.rehydrate();
  }, []);

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
    }
  }, [address, logout, setAddress]);

  return null; // or return children if there are children to render
};
