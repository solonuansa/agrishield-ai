"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { clearSession, readSession } from "@/lib/auth";
import { useToast } from "@/lib/hooks/useToast";

const linkDefs = [
  { href: "/", key: "home" },
  { href: "/scan", key: "scan" },
  { href: "/map", key: "map" },
  { href: "/community", key: "community" },
  { href: "/dashboard", key: "dashboard" },
];

const languages = [
  { code: "id", label: "ID" },
  { code: "en", label: "EN" },
];

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [session, setSession] = useState(() => readSession());
  const pathname = usePathname();
  const toast = useToast();

  const links = useMemo(
    () => linkDefs.map((link) => ({ ...link, label: t(`nav.${link.key}`) })),
    [t]
  );

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    clearSession();
    setSession(null);
    toast.success(t("nav.logoutSuccess"));
    router.replace("/");
  };

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const currentLang = i18n.language?.startsWith("en") ? "en" : "id";

  const switchLanguage = (code: string) => {
    i18n.changeLanguage(code);
    document.documentElement.lang = code;
  };

  return (
    <header
      className={`sticky top-0 z-50 border-b border-cream-darker/60 transition-all duration-300 ${
        scrolled ? "bg-cream/90 backdrop-blur-xl shadow-sm" : "bg-cream"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 lg:h-[4.1rem] lg:px-8">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="font-serif text-[1.75rem] font-semibold tracking-tight text-forest-700">AgriShield</span>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">AI</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`relative text-[0.97rem] transition-colors duration-200 ${
                  active
                    ? "font-semibold text-forest-700"
                    : "font-medium text-ink-muted hover:text-forest-600"
                }`}
              >
                {link.label}
                {active && (
                  <motion.span
                    layoutId="navbar-active-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-px bg-forest-500/50"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2.5 md:flex">
          {/* Language switcher */}
          <div className="mr-1 flex items-center gap-0.5 rounded-full border border-cream-darker p-0.5">
            {languages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => switchLanguage(lang.code)}
                className={`rounded-full px-2 py-1 text-[0.65rem] font-bold uppercase tracking-wider transition-colors ${
                  currentLang === lang.code
                    ? "bg-forest-700 text-cream"
                    : "text-ink-muted hover:text-ink"
                }`}
                aria-label={`Switch to ${lang.label}`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {session ? (
            <>
              <Link href="/dashboard" className="rounded-full border border-cream-darker px-3.5 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:border-ink-muted hover:text-ink">
                {session.user.full_name.split(" ")[0]}
              </Link>
              <button type="button" onClick={handleLogout} className="rounded-full bg-clay px-3.5 py-1.5 text-xs font-semibold text-cream transition-colors hover:bg-clay-dark">
                {t("nav.logout")}
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-full border border-cream-darker px-3.5 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:border-ink-muted hover:text-ink">
                {t("nav.login")}
              </Link>
              <Link href="/login?mode=register" className="rounded-full bg-forest-700 px-3.5 py-1.5 text-xs font-semibold text-cream transition-colors hover:bg-forest-800">
                {t("nav.register")}
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="rounded p-2 text-ink-soft md:hidden"
          aria-label={t("nav.menu")}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          <svg width="20" height="14" viewBox="0 0 20 14" fill="none" className={open ? "hidden" : "block"}>
            <path d="M0 1h20M0 7h20M0 13h20" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={open ? "block" : "hidden"}>
            <path d="M1 1l14 14M15 1L1 15" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
            id="mobile-menu"
            className="overflow-hidden border-t border-cream-darker/50 bg-cream/95 md:hidden"
          >
            <div className="px-6 pb-6 pt-4">
              <nav className="flex flex-col gap-2">
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
                  {/* Language switcher mobile */}
                  <div className="flex gap-1 rounded-full bg-cream-200/60 p-0.5 self-start">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          switchLanguage(lang.code);
                          setOpen(false);
                        }}
                        className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors ${
                          currentLang === lang.code
                            ? "bg-forest-700 text-cream"
                            : "text-ink-muted hover:text-ink"
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                  {session ? (
                    <>
                      <Link href="/dashboard" onClick={() => setOpen(false)} className="btn-secondary">
                        {t("nav.dashboard")}
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="btn-primary bg-clay hover:bg-clay-dark"
                      >
                        {t("nav.logout")}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setOpen(false)} className="btn-secondary">
                        {t("nav.login")}
                      </Link>
                      <Link href="/login?mode=register" onClick={() => setOpen(false)} className="btn-primary">
                        {t("nav.register")}
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
