"use client";

import { NotFound as NotFoundTemplate } from "@lightdotso/templates/not-found";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

// -----------------------------------------------------------------------------
// Not Found
// -----------------------------------------------------------------------------

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
    return <div className="h-screen w-full" />;
  }

  return <NotFoundTemplate />;
}
