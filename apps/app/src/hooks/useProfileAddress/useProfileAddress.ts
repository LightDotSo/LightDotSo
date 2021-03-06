import { utils } from "ethers";
import { useRouter } from "next/router";
import { useMemo } from "react";

import { useEnsResolveName } from "@lightdotso/app/hooks/useEnsResolveName";
import { useWallet } from "@lightdotso/app/hooks/useWallet";

export const useProfileAddress = (address?: string) => {
  const { address: walletAddress, isLoading: isWalletLoading } = useWallet();
  const { asPath } = useRouter();

  const slug = useMemo(() => {
    return asPath.split("/").pop();
  }, [asPath]);

  const { address: routerAddress, isLoading: isEnsResolverLoading } =
    useEnsResolveName(slug);

  const profileAddress = useMemo(() => {
    return address ?? asPath.startsWith("/profile")
      ? walletAddress
      : utils.isAddress(slug)
      ? slug
      : routerAddress;
  }, [address, asPath, walletAddress, slug, routerAddress]);

  return {
    isLoading: !profileAddress ?? isWalletLoading ?? isEnsResolverLoading,
    profileAddress: address ?? profileAddress,
  };
};
