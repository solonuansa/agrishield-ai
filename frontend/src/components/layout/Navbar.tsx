"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clearSession, readSession } from "@/lib/auth";

const links = [
  { href: "/scan", label: "Scan" },
  { href: "/map", label: "Peta" },
  { href: "/community", label: "Komunitas" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const session = readSession();

  const handleLogout = () => {
    clearSession();
    if (typeof window !== "undefined") {
      window.location.replace("/");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-cream-darker/50 bg-cream/85 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="font-serif text-3xl font-semibold tracking-tight text-forest-700">AgriShield</span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-warm-gray">AI</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={active ? "relative text-sm font-semibold text-forest-700" : "relative text-sm font-medium text-ink-muted transition-colors hover:text-forest-600"}
              >
                {link.label}
                {active && <span className="absolute -bottom-1 left-0 right-0 h-px bg-forest-500/40" />}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {session ? (
            <>
              <Link href="/dashboard" className="btn-secondary">{session.user.full_name.split(" ")[0]}</Link>
              <button type="button" onClick={handleLogout} className="btn-primary bg-clay hover:bg-clay-dark">
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-secondary">Masuk</Link>
              <Link href="/login?mode=register" className="btn-primary">Daftar</Link>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="rounded p-2 text-ink-soft md:hidden"
          aria-label="Menu"
        >
          <svg width="20" height="14" viewBox="0 0 20 14" fill="none" className={open ? "hidden" : "block"}>
            <path d="M0 1h20M0 7h20M0 13h20" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={open ? "block" : "hidden"}>
            <path d="M1 1l14 14M15 1L1 15" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-cream-darker/50 bg-cream/95 px-6 pb-6 pt-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded px-1 py-2 text-base font-medium text-ink-soft hover:text-forest-700"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-3 border-t border-cream-darker/50 pt-4">
              {session ? (
                <>
                  <Link href="/dashboard" onClick={() => setOpen(false)} className="btn-secondary">
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="btn-primary bg-clay hover:bg-clay-dark"
                  >
                    Keluar
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)} className="btn-secondary">
                    Masuk
                  </Link>
                  <Link href="/login?mode=register" onClick={() => setOpen(false)} className="btn-primary">
                    Daftar
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

