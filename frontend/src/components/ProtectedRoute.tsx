"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState(() => readSession());

  useEffect(() => {
    const handleStorageChange = () => {
      setSession(readSession());
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

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
            {!isAuthenticated ? t("protectedRoute.loadingSecure") : t("protectedRoute.redirecting")}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
