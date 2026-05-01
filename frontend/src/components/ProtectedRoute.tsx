"use client";

import { useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { readSession } from "@/lib/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({
  children,
  adminOnly = false,
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Memoize session read to avoid parsing JSON on every render
  const session = useMemo(() => readSession(), []);
  const isAuthenticated = Boolean(session?.token);
  const isAdmin = session?.user.role === "admin" || session?.user.role === "government";

  useEffect(() => {
    if (!isAuthenticated) {
      const next = encodeURIComponent(pathname || "/dashboard");
      router.replace(`/login?next=${next}`);
    } else if (adminOnly && !isAdmin) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isAdmin, adminOnly, pathname, router]);

  if (!isAuthenticated || (adminOnly && !isAdmin)) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          <p className="text-sm text-ink-muted">
            {!isAuthenticated ? "Memuat halaman aman..." : "Mengarahkan ke dashboard..."}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
