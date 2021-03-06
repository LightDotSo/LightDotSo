import clsx from "clsx";
import Link from "next/link";
import type { FC, AnchorHTMLAttributes } from "react";

export type NetworkHeroInternalButtonProps =
  AnchorHTMLAttributes<HTMLAnchorElement>;

export const NetworkHeroInternalButton: FC<NetworkHeroInternalButtonProps> = ({
  href,
  className,
  children,
  ...rest
}) => {
  return (
    <Link passHref href={href}>
      <a
        href={href}
        className={clsx(
          className,
          "rounded border border-contrast-lower bg-bg py-2 px-3 text-base font-medium text-contrast-higher ring-offset-bg hover:bg-bg-light focus:ring-2 focus:ring-primary focus:ring-offset-2 md:p-3",
        )}
        {...rest}
      >
        {children}
      </a>
    </Link>
  );
};
