"use client";

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
  const session = readSession();
  const isAuthenticated = Boolean(session?.token);
  const isAdmin = session?.user.role === "admin" || session?.user.role === "government";

  if (!isAuthenticated) {
    if (typeof window !== "undefined") {
      const nextPath = encodeURIComponent(window.location.pathname || "/dashboard");
      window.location.replace(`/login?next=${nextPath}`);
    }

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
    if (typeof window !== "undefined") {
      window.location.replace("/dashboard");
    }

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

