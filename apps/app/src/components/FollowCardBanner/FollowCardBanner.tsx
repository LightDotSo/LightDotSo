import type { FC } from "react";

import type { FollowBannerProps } from "@lightdotso/app/components/FollowBanner";
import { FollowBanner } from "@lightdotso/app/components/FollowBanner";
import { FollowButton } from "@lightdotso/app/components/FollowButton";
import { PlaceholderProfile } from "@lightdotso/app/components/PlaceholderProfile";

export type FollowCardBannerProps = FollowBannerProps;

export const FollowCardBanner: FC<FollowCardBannerProps> = ({ address }) => {
  return (
    <div className="flex w-full items-center justify-between space-x-4">
      <PlaceholderProfile address={address} />
      <FollowBanner address={address} />
      <FollowButton address={address} />
    </div>
  );
};
