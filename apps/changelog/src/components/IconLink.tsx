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

import clsx from "clsx";
import Link from "next/link";

export function IconLink({
  children,
  className,
  compact = false,
  large = false,
  icon: Icon,
  ...props
}: React.ComponentPropsWithoutRef<typeof Link> & {
  compact?: boolean;
  large?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      {...props}
      className={clsx(
        className,
        "group relative isolate flex items-center rounded-lg px-2 py-0.5 text-[0.8125rem]/6 font-medium text-white/30 transition-colors hover:text-sky-300",
        compact ? "gap-x-2" : "gap-x-3",
      )}
    >
      <span className="absolute inset-0 -z-10 scale-75 rounded-lg bg-white/5 opacity-0 transition group-hover:scale-100 group-hover:opacity-100" />
      {Icon && (
        <Icon className={clsx("flex-none", large ? "h-6 w-6" : "h-4 w-4")} />
      )}
      <span className="self-baseline text-white">{children}</span>
    </Link>
  );
}
