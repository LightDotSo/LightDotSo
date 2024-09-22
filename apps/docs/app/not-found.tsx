"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function NotFound() {
  // ---------------------------------------------------------------------------
  // Next Hooks
  // ---------------------------------------------------------------------------

  const router = useRouter();
  const pathname = usePathname();

  // ---------------------------------------------------------------------------
  // State Hooks
  // ---------------------------------------------------------------------------

  const [isRefreshed, setIsRefreshed] = useState(false);

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const refreshKey = useMemo(() => `404_Refreshed_${pathname}`, [pathname]);

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const checkAndRefresh = () => {
      const shouldRefresh = !sessionStorage.getItem(refreshKey);
      if (shouldRefresh) {
        sessionStorage.setItem(refreshKey, "true");
        router.refresh();
      } else {
        setIsRefreshed(true);
      }
    };

    checkAndRefresh();

    return () => sessionStorage.removeItem(refreshKey);
  }, [router, refreshKey]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (!isRefreshed) {
    return null;
  }

  return (
    <div>
      <h2>Not Found</h2>
      <p>Could not find requested resource: {pathname}</p>
      <Link href="/">Return Home</Link>
    </div>
  );
}
