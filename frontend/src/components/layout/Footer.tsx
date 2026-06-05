"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Sprout } from "lucide-react";

export default function Footer() {
  const { t } = useTranslation();

  const cols = [
    {
      title: t("footer.product"),
      links: [
        { label: t("nav.home"), href: "/" },
        { label: t("footer.scanDisease"), href: "/scan" },
        { label: t("footer.distributionMap"), href: "/map" },
        { label: t("nav.dashboard"), href: "/dashboard" },
        { label: t("footer.community"), href: "/community" },
      ],
    },
    {
      title: t("footer.quickAccess"),
      links: [
        { label: t("footer.login"), href: "/login" },
        { label: t("footer.register"), href: "/login?mode=register" },
        { label: t("footer.scanHistory"), href: "/history" },
      ],
    },
    {
      title: t("footer.others"),
      links: [
        { label: t("footer.fields"), href: "/fields" },
        { label: t("footer.admin"), href: "/admin" },
        { label: t("footer.map"), href: "/map" },
      ],
    },
  ];

  return (
    <footer className="border-t border-cream-darker/50 bg-cream-dark">
      <div className="mx-auto max-w-6xl px-6 py-6 sm:py-7 lg:px-8 lg:py-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <Link href="/" className="group inline-block">
              <span className="font-serif text-2xl font-semibold text-forest-700 transition-colors group-hover:text-forest-600">
                AgriShield
              </span>
            </Link>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-muted">
              {t("footer.tagline")}
            </p>
            <div className="mt-3 space-y-1 text-sm text-ink-muted">
              <p>halo@agrishield.id</p>
              <p>Yogyakarta, Indonesia</p>
            </div>
          </div>

          <div className="sm:col-span-1 lg:col-span-7">
            <div className="grid grid-cols-3 gap-6 sm:gap-8">
              {cols.map((col) => (
                <div key={col.title}>
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
                    {col.title}
                  </h3>
                  <ul className="space-y-1">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="group/link relative inline-block text-sm text-ink-muted transition-colors duration-200 hover:text-forest-700"
                        >
                          <span>{link.label}</span>
                          <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-forest-400/40 transition-all duration-300 group-hover/link:w-full" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-7">
          <div className="flex items-center gap-2.5 pb-2.5">
            <span className="editorial-line text-cream-darker" />
            <Sprout size={12} strokeWidth={1.5} className="text-forest-400/60 shrink-0" />
            <span className="editorial-line text-cream-darker" />
          </div>
          <div className="flex flex-col gap-1 border-t border-cream-darker/40 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-ink-muted">
              {t("footer.copyright", { year: new Date().getFullYear() })}
            </p>
            <p className="text-xs text-ink-muted">{t("footer.madeFor")}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
