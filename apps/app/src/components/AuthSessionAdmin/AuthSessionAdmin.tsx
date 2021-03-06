import type { FC } from "react";

import { useSession } from "@lightdotso/app/hooks/useSession";

const ADMIN_ADDRESSES = ["0x4fd9D0eE6D6564E80A9Ee00c0163fC952d0A45Ed"];
export const AuthSessionAdmin: FC = ({ children }) => {
  const { session, isLoading } = useSession();

  if (typeof window !== "undefined" && isLoading) {
    return null;
  }

  if (!session) {
    return null;
  }

  if (
    !ADMIN_ADDRESSES.some(address => {
      return address === session.address;
    })
  ) {
    return null;
  }

  return <>{children}</>;
};
