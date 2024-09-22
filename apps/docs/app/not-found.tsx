"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function NotFound() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const refreshKey = `404_Refreshed_${pathname}`;
    const shouldRefresh = sessionStorage.getItem(refreshKey) !== "true";

    if (shouldRefresh) {
      sessionStorage.setItem(refreshKey, "true");
      router.refresh();
    }

    // Clean up the session storage when component unmounts
    return () => {
      sessionStorage.removeItem(refreshKey);
    };
  }, [router, pathname]);

  return (
    <div>
      <h2>Not Found</h2>
      <p>Could not find requested resource: {pathname}</p>
      <Link href="/">Return Home</Link>
    </div>
  );
}
