"use client";

import { useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
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
  const session = readSession();

  const isAuthenticated = Boolean(session?.token);
  const isAdmin = session?.user.role === "admin" || session?.user.role === "government";
  const nextPath = useMemo(
    () => encodeURIComponent(pathname || "/dashboard"),
    [pathname]
  );

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(`/login?next=${nextPath}`);
      return;
    }

    if (adminOnly && !isAdmin) {
      router.replace("/dashboard");
    }
  }, [adminOnly, isAdmin, isAuthenticated, nextPath, router]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          <p className="text-sm text-ink-muted">Memuat halaman aman...</p>
        </div>
      </div>
    );
  }

  if (adminOnly && !isAdmin) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          <p className="text-sm text-ink-muted">Mengarahkan ke dashboard...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
